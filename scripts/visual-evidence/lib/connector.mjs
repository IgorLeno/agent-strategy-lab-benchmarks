// Algoritmo determinístico de connector preview.
// Só resize proporcional + JPEG. Sem filtro, crop, sharpen ou correção de cor.
export const CONNECTOR_MAX_BYTES = 40_960;
export const CONNECTOR_PREFERRED_WIDTH = 960;
export const CONNECTOR_MIN_WIDTH = 800;
export const CONNECTOR_WIDTH_STEP = 80;
export const CONNECTOR_QUALITY_STEPS = Object.freeze([80, 72, 64, 56, 48, 40, 32]);

export function minAllowedWidth(sourceWidth) {
  return Math.min(CONNECTOR_MIN_WIDTH, sourceWidth);
}

export function scaledHeight(sourceWidth, sourceHeight, width) {
  return Math.max(1, Math.round((sourceHeight * width) / sourceWidth));
}

/** Larguras tentadas, da preferida até o piso. Nunca upscale. Nunca abaixo de min(800, source). */
export function widthLadder(sourceWidth) {
  if (!Number.isInteger(sourceWidth) || sourceWidth < 1) {
    throw new Error(`source width inválida: ${sourceWidth}`);
  }
  const preferred = Math.min(CONNECTOR_PREFERRED_WIDTH, sourceWidth);
  const floor = minAllowedWidth(sourceWidth);
  const widths = [];
  let width = preferred;
  while (width >= floor) {
    widths.push(width);
    if (width === floor) break;
    width = Math.max(floor, width - CONNECTOR_WIDTH_STEP);
  }
  return widths;
}

export function encodePlan(sourceWidth, sourceHeight) {
  return widthLadder(sourceWidth).flatMap((width) =>
    CONNECTOR_QUALITY_STEPS.map((quality) => ({
      width,
      height: scaledHeight(sourceWidth, sourceHeight, width),
      quality,
    })),
  );
}

export class ConnectorBudgetError extends Error {
  constructor(sourceWidth, sourceHeight) {
    super(
      `CONNECTOR_BUDGET_EXCEEDED: nenhum JPEG <= ${CONNECTOR_MAX_BYTES} bytes com largura >= ${minAllowedWidth(sourceWidth)}px (source ${sourceWidth}x${sourceHeight}). O budget de 40 KiB precisa ser revisto.`,
    );
    this.name = 'ConnectorBudgetError';
  }
}

export function previewHtml({ filename, width, height }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <style>
    html, body { margin: 0; padding: 0; background: #fff; }
    img { display: block; width: ${width}px; height: ${height}px; image-rendering: auto; }
  </style>
</head>
<body>
  <img src="${filename}" width="${width}" height="${height}" alt="">
</body>
</html>
`;
}
