import { evaluate, sleep } from './chrome.mjs';

function testidSelector(testid) {
  return `[data-testid="${testid}"]`;
}

export async function applyAction(send, action) {
  switch (action.type) {
    case 'wait':
      await sleep(action.ms ?? 150);
      return;
    case 'set-filter': {
      const kind = action.filter;
      const value = action.value;
      const attribute = kind === 'period' ? 'data-period' : 'data-segment';
      const applied = await evaluate(
        send,
        `(() => {
          const root = document.querySelector(${JSON.stringify(testidSelector(`filter-${kind}`))});
          if (!root) return { ok: false, reason: 'root-missing' };
          const button = root.querySelector(${JSON.stringify(`[${attribute}="${value}"]`)});
          if (button) { button.click(); return { ok: true, via: 'button' }; }
          const select = root.tagName === 'SELECT' ? root : root.querySelector('select');
          if (select) {
            select.value = ${JSON.stringify(value)};
            select.dispatchEvent(new Event('input', { bubbles: true }));
            select.dispatchEvent(new Event('change', { bubbles: true }));
            return { ok: true, via: 'select' };
          }
          return { ok: false, reason: 'control-missing' };
        })()`,
      );
      if (!applied?.ok) {
        throw new Error(`set-filter ${kind}=${value} falhou (${applied?.reason ?? 'unknown'})`);
      }
      await sleep(action.wait_ms ?? 200);
      return;
    }
    case 'click-testid': {
      const nth = action.nth ?? 0;
      const clicked = await evaluate(
        send,
        `(() => {
          const nodes = [...document.querySelectorAll(${JSON.stringify(testidSelector(action.testid))})];
          const node = nodes[${nth}];
          if (!node) return { ok: false, count: nodes.length };
          node.click();
          return { ok: true, count: nodes.length };
        })()`,
      );
      if (!clicked?.ok) {
        throw new Error(`click-testid ${action.testid}[${nth}] ausente (count=${clicked?.count ?? 0})`);
      }
      await sleep(action.wait_ms ?? 200);
      return;
    }
    default: {
      const _exhaustive = action.type;
      throw new Error(`ação não suportada: ${_exhaustive}`);
    }
  }
}

export async function applyActions(send, actions) {
  for (const action of actions ?? []) await applyAction(send, action);
}

export async function targetClip(send, target) {
  if (!target || target.kind === 'page') return null;
  if (target.kind === 'testid') {
    const nth = target.nth;
    const all = Boolean(target.all) || nth == null;
    const box = await evaluate(
      send,
      `(() => {
        const nodes = [...document.querySelectorAll(${JSON.stringify(testidSelector(target.testid))})];
        if (nodes.length === 0) return null;
        const selected = ${all ? 'nodes' : `nodes[${Number(nth)}] ? [nodes[${Number(nth)}]] : []`};
        if (selected.length === 0) return { missing: true, count: nodes.length };
        const rects = selected.map((node) => node.getBoundingClientRect());
        const x = Math.min(...rects.map((rect) => rect.x)) + window.scrollX;
        const y = Math.min(...rects.map((rect) => rect.y)) + window.scrollY;
        const right = Math.max(...rects.map((rect) => rect.x + rect.width)) + window.scrollX;
        const bottom = Math.max(...rects.map((rect) => rect.y + rect.height)) + window.scrollY;
        return { x, y, width: right - x, height: bottom - y, count: nodes.length };
      })()`,
    );
    if (!box || box.missing) throw new Error(`target ${target.testid} ausente`);
    return box;
  }
  if (target.kind === 'union') {
    const boxes = [];
    for (const part of target.hooks) {
      const clip = await targetClip(send, { kind: 'testid', ...part });
      if (clip) boxes.push(clip);
    }
    if (boxes.length === 0) throw new Error('union vazio');
    const x = Math.min(...boxes.map((box) => box.x));
    const y = Math.min(...boxes.map((box) => box.y));
    const right = Math.max(...boxes.map((box) => box.x + box.width));
    const bottom = Math.max(...boxes.map((box) => box.y + box.height));
    return { x, y, width: right - x, height: bottom - y };
  }
  throw new Error(`target.kind não suportado: ${target.kind}`);
}
