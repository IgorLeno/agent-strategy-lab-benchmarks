import { readFileSync } from 'node:fs';

export const CAPTURE_CONFIG_KIND = 'VisualCaptureConfigV1';

const B04_TESTIDS = new Set([
  'kpi',
  'filter-period',
  'filter-segment',
  'chart',
  'segment-table',
  'segment-row',
]);

const B04_PERIODS = new Set(['full-year', 'q1', 'q2', 'q3', 'q4']);
const B04_SEGMENTS = new Set(['all', 'enterprise', 'mid-market', 'smb']);

export function loadJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

export function loadCaptureConfig(filePath) {
  const config = loadJson(filePath);
  const errors = validateCaptureConfig(config);
  if (errors.length > 0) throw new Error(`${filePath}:\n- ${errors.join('\n- ')}`);
  return config;
}

export function validateCaptureConfig(config) {
  const errors = [];
  if (config?.kind !== CAPTURE_CONFIG_KIND) errors.push(`kind deve ser ${CAPTURE_CONFIG_KIND}`);
  if (config?.schema_version !== 1) errors.push('schema_version deve ser 1');
  if (!config?.benchmark_id) errors.push('benchmark_id obrigatório');
  if (!config?.capture_protocol) errors.push('capture_protocol obrigatório');
  if (!config?.viewports?.desktop || !config?.viewports?.mobile) errors.push('viewports.desktop e viewports.mobile obrigatórios');
  if (!Array.isArray(config?.screenshots) || config.screenshots.length === 0) {
    errors.push('screenshots[] vazio');
  }
  const ids = new Set();
  for (const [index, shot] of (config?.screenshots ?? []).entries()) {
    if (!shot.id || !shot.filename) errors.push(`screenshots[${index}] precisa de id e filename`);
    if (ids.has(shot.id)) errors.push(`id duplicado: ${shot.id}`);
    ids.add(shot.id);
    if (shot.filename?.includes('/') || shot.filename?.includes('\\')) {
      errors.push(`screenshots[${index}].filename deve ser basename`);
    }
    if (shot.viewport !== 'desktop' && shot.viewport !== 'mobile') {
      errors.push(`screenshots[${index}].viewport inválido`);
    }
    if (shot.selector) errors.push(`screenshots[${index}].selector cru proibido; use target estruturado`);
  }
  if (Array.isArray(config.connector_previews)) {
    const shotIds = new Set((config.screenshots ?? []).map((shot) => shot.id));
    const previewIds = new Set();
    for (const [index, preview] of config.connector_previews.entries()) {
      if (!preview.id || !preview.filename || !preview.source_screenshot_id) {
        errors.push(`connector_previews[${index}] precisa de id, filename e source_screenshot_id`);
      }
      if (preview.filename && !preview.filename.endsWith('.jpg')) {
        errors.push(`connector_previews[${index}].filename deve ser .jpg`);
      }
      if (preview.filename?.includes('/') || preview.id?.includes('/') ) {
        errors.push(`connector_previews[${index}] path em id/filename`);
      }
      if (!shotIds.has(preview.source_screenshot_id)) {
        errors.push(`connector_previews[${index}] source desconhecido: ${preview.source_screenshot_id}`);
      }
      const source = (config.screenshots ?? []).find((shot) => shot.id === preview.source_screenshot_id);
      if (source?.full_page) {
        errors.push(`connector_previews[${index}] não pode usar full-page como preview primário`);
      }
      if (previewIds.has(preview.id)) errors.push(`connector preview id duplicado: ${preview.id}`);
      previewIds.add(preview.id);
    }
  }
  return errors;
}

function collectTestIds(node, found) {
  if (!node || typeof node !== 'object') return;
  if (typeof node.testid === 'string') found.add(node.testid);
  if (Array.isArray(node)) {
    for (const item of node) collectTestIds(item, found);
    return;
  }
  for (const value of Object.values(node)) collectTestIds(value, found);
}

export function assertContractHooksOnly(config, { allowedTestIds = B04_TESTIDS } = {}) {
  const used = new Set();
  collectTestIds(config, used);
  const extra = [...used].filter((id) => !allowedTestIds.has(id));
  if (extra.length > 0) {
    throw new Error(`hooks fora do contrato: ${extra.join(', ')}`);
  }
  const raw = JSON.stringify(config);
  if (/#[A-Za-z]|class=|\.[a-zA-Z][\w-]*\s*\{/.test(raw) && /querySelector|getElementById|css selector/i.test(raw)) {
    throw new Error('configuração contém seletor de implementação');
  }
  if (/#[A-Za-z][\w-]*/.test(raw)) {
    throw new Error('configuração contém seletor por id de implementação');
  }
  for (const shot of [...(config.screenshots ?? []), ...(config.connector_previews ?? [])]) {
    for (const action of shot.actions ?? []) {
      if (action.type === 'set-filter') {
        if (action.filter === 'period' && !B04_PERIODS.has(action.value)) {
          throw new Error(`period não congelado: ${action.value}`);
        }
        if (action.filter === 'segment' && !B04_SEGMENTS.has(action.value)) {
          throw new Error(`segment não congelado: ${action.value}`);
        }
        if (action.filter !== 'period' && action.filter !== 'segment') {
          throw new Error(`filtro desconhecido: ${action.filter}`);
        }
      }
    }
  }
  return [...used];
}
