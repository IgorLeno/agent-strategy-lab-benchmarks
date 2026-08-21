import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const CANDIDATES = [
  process.env.CHROME_PATH,
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/snap/bin/chromium',
].filter(Boolean);

export function resolveChrome() {
  const found = CANDIDATES.find((candidate) => existsSync(candidate));
  if (!found) {
    throw new Error(`nenhum Chrome encontrado; candidatos: ${CANDIDATES.join(', ')}`);
  }
  return found;
}

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function unusedPort() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close((error) => (error ? reject(error) : resolve(port)));
    });
    server.on('error', reject);
  });
}

async function waitForVersion(port, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  let lastError = null;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (response.ok) return response.json();
    } catch (error) {
      lastError = error;
    }
    await sleep(50);
  }
  throw new Error(`Chrome DevTools não respondeu em 127.0.0.1:${port}: ${lastError ?? 'timeout'}`);
}

class CdpConnection {
  constructor(webSocket) {
    this.ws = webSocket;
    this.nextId = 0;
    this.pending = new Map();
    this.events = new Map();
    this.ws.addEventListener('message', (event) => this.#onMessage(event.data));
  }

  #onMessage(raw) {
    const message = JSON.parse(raw);
    if (message.id != null && this.pending.has(message.id)) {
      const { resolve, reject } = this.pending.get(message.id);
      this.pending.delete(message.id);
      if (message.error) reject(new Error(`${message.error.message} (${message.error.code})`));
      else resolve(message.result);
      return;
    }
    if (message.method) {
      const waiters = this.events.get(message.method);
      if (waiters && waiters.length > 0) {
        const waiter = waiters.shift();
        waiter(message.params);
      }
    }
  }

  send(method, params = {}, sessionId) {
    const id = ++this.nextId;
    const payload = { id, method, params };
    if (sessionId) payload.sessionId = sessionId;
    this.ws.send(JSON.stringify(payload));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
    });
  }

  waitFor(method) {
    return new Promise((resolve) => {
      const list = this.events.get(method) ?? [];
      list.push(resolve);
      this.events.set(method, list);
    });
  }

  close() {
    this.ws.close();
  }
}

async function openWebSocket(url) {
  const ws = new WebSocket(url);
  await new Promise((resolve, reject) => {
    ws.addEventListener('open', resolve, { once: true });
    ws.addEventListener('error', () => reject(new Error(`falha no WebSocket ${url}`)), { once: true });
  });
  return new CdpConnection(ws);
}

export async function launchChrome() {
  const executablePath = resolveChrome();
  const userDataDir = mkdtempSync(path.join(os.tmpdir(), 'visual-evidence-chrome-'));
  const port = await unusedPort();
  const child = spawn(
    executablePath,
    [
      '--headless=new',
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--hide-scrollbars',
      '--no-first-run',
      '--no-default-browser-check',
      '--force-device-scale-factor=1',
      '--remote-allow-origins=*',
      `--user-data-dir=${userDataDir}`,
      `--remote-debugging-port=${port}`,
      'about:blank',
    ],
    { stdio: ['ignore', 'pipe', 'pipe'] },
  );

  let stderr = '';
  child.stderr.on('data', (chunk) => {
    stderr += chunk.toString();
  });

  const closed = new Promise((resolve) => child.on('exit', resolve));

  try {
    const version = await waitForVersion(port, 20_000);
    const browser = await openWebSocket(version.webSocketDebuggerUrl);
    const close = async () => {
      try {
        browser.close();
      } catch {
        // Chrome pode já ter saído.
      }
      child.kill('SIGKILL');
      await closed;
      rmSync(userDataDir, { recursive: true, force: true });
    };
    return { browser, close, port };
  } catch (error) {
    child.kill('SIGKILL');
    await closed;
    rmSync(userDataDir, { recursive: true, force: true });
    throw new Error(`${error.message}\n${stderr.slice(-2000)}`);
  }
}

export async function attachPage(browser, url, viewport) {
  const { targetId } = await browser.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await browser.send('Target.attachToTarget', { targetId, flatten: true });
  const send = (method, params = {}) => browser.send(method, params, sessionId);

  await send('Page.enable');
  await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: viewport.deviceScaleFactor ?? 1,
    mobile: Boolean(viewport.mobile),
  });

  await send('Page.navigate', { url });
  await send('Runtime.evaluate', {
    expression: `new Promise((resolve, reject) => {
      const done = () => resolve(document.readyState);
      if (document.readyState === 'complete') done();
      else window.addEventListener('load', done, { once: true });
      setTimeout(() => reject(new Error('timeout load')), 60_000);
    })`,
    awaitPromise: true,
  });
  await send('Runtime.evaluate', {
    expression: `Promise.all([...document.images].map((img) => img.complete ? null : new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; })))`,
    awaitPromise: true,
  });
  return { send, sessionId, targetId };
}

export async function capturePng(send, options = {}) {
  const params = { format: 'png', fromSurface: true };
  if (options.fullPage) {
    const metrics = await send('Page.getLayoutMetrics');
    const width = Math.ceil(metrics.cssContentSize?.width ?? metrics.contentSize.width);
    const height = Math.ceil(metrics.cssContentSize?.height ?? metrics.contentSize.height);
    await send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: options.deviceScaleFactor ?? 1,
      mobile: Boolean(options.mobile),
    });
    params.captureBeyondViewport = true;
  }
  if (options.clip) {
    params.clip = {
      x: Math.max(0, Math.floor(options.clip.x)),
      y: Math.max(0, Math.floor(options.clip.y)),
      width: Math.max(1, Math.ceil(options.clip.width)),
      height: Math.max(1, Math.ceil(options.clip.height)),
      scale: 1,
    };
  }
  const { data } = await send('Page.captureScreenshot', params);
  return Buffer.from(data, 'base64');
}

export async function captureJpeg(send, options = {}) {
  const quality = options.quality;
  if (!Number.isInteger(quality) || quality < 0 || quality > 100) {
    throw new Error(`jpeg quality inválida: ${quality}`);
  }
  const params = { format: 'jpeg', quality, fromSurface: true };
  if (options.clip) {
    params.clip = {
      x: Math.max(0, Math.floor(options.clip.x)),
      y: Math.max(0, Math.floor(options.clip.y)),
      width: Math.max(1, Math.ceil(options.clip.width)),
      height: Math.max(1, Math.ceil(options.clip.height)),
      scale: 1,
    };
  }
  const { data } = await send('Page.captureScreenshot', params);
  return Buffer.from(data, 'base64');
}

export async function printToPdf(send, options = {}) {
  const { data } = await send('Page.printToPDF', {
    printBackground: true,
    displayHeaderFooter: false,
    preferCSSPageSize: Boolean(options.preferCSSPageSize),
    paperWidth: options.paperWidth,
    paperHeight: options.paperHeight,
    marginTop: options.marginTop ?? 0,
    marginBottom: options.marginBottom ?? 0,
    marginLeft: options.marginLeft ?? 0,
    marginRight: options.marginRight ?? 0,
    generateDocumentOutline: false,
  });
  return Buffer.from(data, 'base64');
}

export async function evaluate(send, expression) {
  const result = await send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) {
    const text = result.exceptionDetails.text ?? JSON.stringify(result.exceptionDetails);
    throw new Error(`Runtime.evaluate: ${text}`);
  }
  return result.result?.value;
}
