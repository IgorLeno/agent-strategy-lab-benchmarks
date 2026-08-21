import { assertBlindCandidateId, assertNoAbsoluteLocalPath, containsAbsoluteLocalPath } from './paths.mjs';

export const MANIFEST_SCHEMA_VERSION = 1;
export const MANIFEST_KIND = 'VisualEvidenceManifestV1';

const REQUIRED_SHOT_FIELDS = [
  'id',
  'filename',
  'sha256',
  'width',
  'height',
  'viewport_width',
  'viewport_height',
  'full_page',
  'state',
  'pdf_page',
];

export function validateManifest(manifest) {
  const errors = [];
  if (!manifest || typeof manifest !== 'object') return ['manifest ausente'];
  if (manifest.schema_version !== MANIFEST_SCHEMA_VERSION) {
    errors.push(`schema_version deve ser ${MANIFEST_SCHEMA_VERSION}`);
  }
  if (manifest.kind !== MANIFEST_KIND) errors.push(`kind deve ser ${MANIFEST_KIND}`);
  for (const field of ['experiment_id', 'candidate_id', 'source_build_identity', 'capture_protocol', 'generated_at']) {
    if (!manifest[field] || typeof manifest[field] !== 'string') errors.push(`${field} obrigatório`);
  }
  try {
    assertBlindCandidateId(manifest.candidate_id);
  } catch (error) {
    errors.push(error.message);
  }
  if (containsAbsoluteLocalPath(manifest)) errors.push('manifest contém path absoluto local');
  if (!Array.isArray(manifest.screenshots) || manifest.screenshots.length === 0) {
    errors.push('screenshots[] não pode ser vazio');
  }
  const pages = new Set();
  for (const [index, shot] of (manifest.screenshots ?? []).entries()) {
    for (const field of REQUIRED_SHOT_FIELDS) {
      if (shot[field] === undefined || shot[field] === null || shot[field] === '') {
        errors.push(`screenshots[${index}].${field} obrigatório`);
      }
    }
    if (shot.selector === undefined) errors.push(`screenshots[${index}].selector deve existir (string ou null)`);
    if (shot.filename && (shot.filename.includes('/') || shot.filename.includes('\\'))) {
      errors.push(`screenshots[${index}].filename deve ser basename, sem diretório`);
    }
    if (shot.sha256 && !/^[a-f0-9]{64}$/.test(shot.sha256)) {
      errors.push(`screenshots[${index}].sha256 inválido`);
    }
    if (!Number.isInteger(shot.pdf_page) || shot.pdf_page < 1) {
      errors.push(`screenshots[${index}].pdf_page deve ser inteiro >= 1`);
    }
    if (pages.has(shot.pdf_page)) {
      errors.push(`pdf_page duplicado: ${shot.pdf_page}`);
    }
    pages.add(shot.pdf_page);
    if (shot.pdf_page_span != null && (!Number.isInteger(shot.pdf_page_span) || shot.pdf_page_span < 1)) {
      errors.push(`screenshots[${index}].pdf_page_span inválido`);
    }
  }
  const pdf = manifest.review_pdf;
  if (!pdf || typeof pdf !== 'object') errors.push('review_pdf obrigatório');
  else {
    if (!pdf.filename || pdf.filename.includes('/') || pdf.filename.includes('\\')) {
      errors.push('review_pdf.filename deve ser basename');
    }
    if (!/^[a-f0-9]{64}$/.test(pdf.sha256 ?? '')) errors.push('review_pdf.sha256 inválido');
    if (!Number.isInteger(pdf.page_count) || pdf.page_count < 1) errors.push('review_pdf.page_count inválido');
    if (!Array.isArray(manifest.pdf_pages) || manifest.pdf_pages.length !== pdf.page_count) {
      errors.push('pdf_pages deve ter exatamente review_pdf.page_count entradas');
    } else {
      manifest.pdf_pages.forEach((entry, index) => {
        if (entry.page !== index + 1) errors.push(`pdf_pages[${index}].page deve ser ${index + 1}`);
        if (!entry.screenshot_id || !entry.filename) {
          errors.push(`pdf_pages[${index}] precisa de screenshot_id e filename`);
        }
        const shot = (manifest.screenshots ?? []).find((item) => item.id === entry.screenshot_id);
        if (!shot) errors.push(`pdf_pages[${index}] screenshot_id desconhecido: ${entry.screenshot_id}`);
        else if (shot.filename !== entry.filename) {
          errors.push(`pdf_pages[${index}] filename não coincide com o screenshot`);
        }
      });
    }
  }
  return errors;
}

export function assertValidManifest(manifest) {
  const errors = validateManifest(manifest);
  if (errors.length > 0) throw new Error(`manifest inválido:\n- ${errors.join('\n- ')}`);
  assertNoAbsoluteLocalPath(manifest, 'manifest');
}
