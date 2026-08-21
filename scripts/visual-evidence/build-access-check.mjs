#!/usr/bin/env node
// Regenera o access-check a partir dos PNGs B03 já publicados.
// Não relança workers. Não recaptura. Não consome quota de modelo.
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, '../..');
const build = path.join(here, 'build-review.mjs');
const pages = path.join(here, 'fixtures/b03-access-check-pages.json');
const experiment = 'CLAUDE-SONNET5-MEDIUM-B03-V1';
const protocol = 'CLAUDE-SONNET5-MEDIUM-B03-V1-screenshots';

function run(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, { stdio: 'inherit', cwd: repo });
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`saiu ${code}`))));
  });
}

await run([
  build,
  '--screenshots',
  `experiments/${experiment}/direct/screenshots`,
  '--capture-json',
  `experiments/${experiment}/direct/screenshots/capture.json`,
  '--out',
  'evaluation/visual-access-check/candidate-x',
  '--experiment-id',
  experiment,
  '--candidate-id',
  'candidate-x',
  '--source-build-identity',
  'unpublished-arm-identity',
  '--capture-protocol',
  protocol,
  '--pages-json',
  pages,
]);

await run([
  build,
  '--screenshots',
  `experiments/${experiment}/agentlab/screenshots`,
  '--capture-json',
  `experiments/${experiment}/agentlab/screenshots/capture.json`,
  '--out',
  'evaluation/visual-access-check/candidate-y',
  '--experiment-id',
  experiment,
  '--candidate-id',
  'candidate-y',
  '--source-build-identity',
  'unpublished-arm-identity',
  '--capture-protocol',
  protocol,
  '--pages-json',
  pages,
]);
