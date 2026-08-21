export function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function pageCss(paperWidthIn, paperHeightIn) {
  return `
    @page { size: ${paperWidthIn}in ${paperHeightIn}in; margin: 0.35in; }
    html, body { margin: 0; padding: 0; background: #fff; }
    * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .meta {
      font-family: ui-sans-serif, system-ui, sans-serif;
      font-size: 10pt;
      line-height: 1.3;
      color: #111;
      margin: 0 0 8px 0;
    }
    .meta h1 { font-size: 13pt; margin: 0 0 2px 0; font-weight: 650; }
    .meta p { margin: 0; }
    .meta code { font-family: ui-monospace, monospace; font-size: 9pt; }
    img {
      display: block;
      width: var(--shot-width);
      max-width: 100%;
      height: auto;
      background: #fff;
    }
  `;
}

export function reviewSheetHtml({ candidateId, experimentId, shot, paperWidthIn, paperHeightIn }) {
  const title = `Visual review — ${candidateId}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <style>${pageCss(paperWidthIn, paperHeightIn)}</style>
</head>
<body>
  <header class="meta">
    <h1>${escapeHtml(shot.review_label ?? shot.id)}</h1>
    <p>${escapeHtml(title)}</p>
    <p>experiment: ${escapeHtml(experimentId)} · screenshot: ${escapeHtml(shot.id)}</p>
    <p>source PNG: <code>${escapeHtml(shot.filename)}</code> · ${shot.width}×${shot.height}px</p>
    <p>sha256: <code>${escapeHtml(shot.sha256)}</code></p>
  </header>
  <img src="${escapeHtml(shot.filename)}" width="${shot.width}" height="${shot.height}" style="--shot-width: ${shot.width}px" alt="${escapeHtml(shot.id)}">
</body>
</html>
`;
}

export function paperSizeFor(shot) {
  const marginIn = 0.8;
  const headerIn = 1.7;
  const widthIn = Math.max(8.5, shot.width / 96 + marginIn);
  const naturalHeightIn = shot.height / 96 + headerIn + marginIn;
  const maxHeightIn = 18;
  if (naturalHeightIn <= maxHeightIn) {
    return { paperWidthIn: Number(widthIn.toFixed(3)), paperHeightIn: Number(naturalHeightIn.toFixed(3)), paginates: false };
  }
  return { paperWidthIn: Number(widthIn.toFixed(3)), paperHeightIn: maxHeightIn, paginates: true };
}
