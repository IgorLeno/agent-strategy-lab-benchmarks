import { assertBlindCandidateId, assertNoAbsoluteLocalPath, containsAbsoluteLocalPath, isBlindSafeText } from './paths.mjs';
import { CONNECTOR_MAX_BYTES } from './connector.mjs';

export const CONNECTOR_MANIFEST_KIND = 'ConnectorPreviewManifestV1';
export const CONNECTOR_MANIFEST_SCHEMA_VERSION = 1;

const REQUIRED = [
  'id',
  'filename',
  'sha256',
  'byte_size',
  'width',
  'height',
  'jpeg_quality',
  'candidate_id',
];

export function validateConnectorManifest(manifest) {
  const errors = [];
  if (!manifest || typeof manifest !== 'object') return ['manifest ausente'];
  if (manifest.kind !== CONNECTOR_MANIFEST_KIND) errors.push(`kind deve ser ${CONNECTOR_MANIFEST_KIND}`);
  if (manifest.schema_version !== CONNECTOR_MANIFEST_SCHEMA_VERSION) {
    errors.push('schema_version deve ser 1');
  }
  for (const field of ['experiment_id', 'candidate_id', 'capture_protocol', 'generated_at']) {
    if (!manifest[field] || typeof manifest[field] !== 'string') errors.push(`${field} obrigatório`);
  }
  try {
    assertBlindCandidateId(manifest.candidate_id);
  } catch (error) {
    errors.push(error.message);
  }
  if (manifest.size_budget_bytes !== CONNECTOR_MAX_BYTES) {
    errors.push(`size_budget_bytes deve ser ${CONNECTOR_MAX_BYTES}`);
  }
  if (containsAbsoluteLocalPath(manifest)) errors.push('manifest contém path absoluto local');
  if (!Array.isArray(manifest.previews) || manifest.previews.length === 0) {
    errors.push('previews[] vazio');
  }
  const ids = new Set();
  for (const [index, preview] of (manifest.previews ?? []).entries()) {
    for (const field of REQUIRED) {
      if (preview[field] === undefined || preview[field] === null || preview[field] === '') {
        errors.push(`previews[${index}].${field} obrigatório`);
      }
    }
    if (preview.filename && (preview.filename.includes('/') || preview.filename.includes('\\'))) {
      errors.push(`previews[${index}].filename deve ser basename`);
    }
    if (preview.filename && !preview.filename.endsWith('.jpg')) {
      errors.push(`previews[${index}].filename deve terminar em .jpg`);
    }
    if (!isBlindSafeText(preview.filename) || !isBlindSafeText(preview.id)) {
      errors.push(`previews[${index}] revela identidade de braço`);
    }
    if (preview.encoding !== 'jpeg') errors.push(`previews[${index}].encoding deve ser jpeg`);
    if (preview.sha256 && !/^[a-f0-9]{64}$/.test(preview.sha256)) {
      errors.push(`previews[${index}].sha256 inválido`);
    }
    if (!Number.isInteger(preview.byte_size) || preview.byte_size < 1) {
      errors.push(`previews[${index}].byte_size inválido`);
    }
    if (preview.byte_size > CONNECTOR_MAX_BYTES) {
      errors.push(`previews[${index}] excede ${CONNECTOR_MAX_BYTES} bytes (${preview.byte_size})`);
    }
    if (!Number.isInteger(preview.width) || preview.width < 1) errors.push(`previews[${index}].width inválido`);
    if (!Number.isInteger(preview.height) || preview.height < 1) errors.push(`previews[${index}].height inválido`);
    if (!Number.isInteger(preview.jpeg_quality) || preview.jpeg_quality < 1 || preview.jpeg_quality > 100) {
      errors.push(`previews[${index}].jpeg_quality inválido`);
    }
    if (!preview.source_png || typeof preview.source_png !== 'object') {
      errors.push(`previews[${index}].source_png obrigatório`);
    } else {
      if (!preview.source_png.filename || preview.source_png.filename.includes('/') || preview.source_png.filename.includes('\\')) {
        errors.push(`previews[${index}].source_png.filename deve ser basename`);
      }
      if (!/^[a-f0-9]{64}$/.test(preview.source_png.sha256 ?? '')) {
        errors.push(`previews[${index}].source_png.sha256 inválido`);
      }
    }
    if (preview.candidate_id !== manifest.candidate_id) {
      errors.push(`previews[${index}].candidate_id diverge do manifest`);
    }
    if (ids.has(preview.id)) errors.push(`id duplicado: ${preview.id}`);
    ids.add(preview.id);
  }
  return errors;
}

export function assertValidConnectorManifest(manifest) {
  const errors = validateConnectorManifest(manifest);
  if (errors.length > 0) throw new Error(`connector manifest inválido:\n- ${errors.join('\n- ')}`);
  assertNoAbsoluteLocalPath(manifest, 'connector manifest');
}
