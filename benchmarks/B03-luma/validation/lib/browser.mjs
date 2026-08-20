// Chrome do sistema via puppeteer-core. Nenhum download de browser acontece
// durante a validação: o caminho é resolvido entre candidatos conhecidos e a
// ausência falha fechado, com mensagem acionável.
import { existsSync, mkdtempSync } from 'node:fs';
import { rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import puppeteer from 'puppeteer-core';

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
    throw new Error(
      `nenhum Chrome encontrado; candidatos testados: ${CANDIDATES.join(', ')}`,
    );
  }
  return found;
}

export async function launchBrowser() {
  const userDataDir = mkdtempSync(path.join(os.tmpdir(), 'benchmark-chrome-'));
  const browser = await puppeteer.launch({
    executablePath: resolveChrome(),
    headless: true,
    userDataDir,
    args: [
      '--no-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--hide-scrollbars',
      '--force-device-scale-factor=1',
    ],
  });
  const close = async () => {
    await browser.close();
    rmSync(userDataDir, { recursive: true, force: true });
  };
  return { browser, close };
}

/**
 * Abre `url` num viewport e devolve a página junto dos diagnósticos coletados
 * desde o primeiro byte: erros de console, exceções não tratadas e a lista de
 * requests, usada para provar que nenhum asset remoto foi carregado.
 */
export async function openPage(browser, url, viewport) {
  const page = await browser.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const requests = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(String(error?.message ?? error)));
  page.on('request', (request) => requests.push(request.url()));
  await page.setViewport({ deviceScaleFactor: 1, ...viewport });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 60_000 });
  return { page, consoleErrors, pageErrors, requests };
}

export const VIEWPORT_DESKTOP = { width: 1440, height: 900 };
export const VIEWPORT_MOBILE = { width: 390, height: 844 };
export const VIEWPORT_MOBILE_TOUCH = { width: 390, height: 844, hasTouch: true, isMobile: true };

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
