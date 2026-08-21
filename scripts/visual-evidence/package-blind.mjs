#!/usr/bin/env node
// Empacota dois diretórios de PNG em Candidate X / Candidate Y.
// O mapping real é escrito apenas em --map-out (gitignore). Nunca no bundle.
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseArgs } from './lib/cli.mjs';
import { assertBlindCandidateId, assertNoAbsoluteLocalPath } from './lib/paths.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const args = parseArgs(process.argv.slice(2));

if (!args['experiment-id'] || !args.out || !args['map-out'] || !args.x || !args.y) {
  console.error(
    'uso: package-blind.mjs --experiment-id ID --x DIR --y DIR --out evaluation/blind --map-out .runs/ID/blind-map.json',
  );
  process.exit(2);
}

assertBlindCandidateId('candidate-x');
assertBlindCandidateId('candidate-y');
assertNoAbsoluteLocalPath(args['experiment-id'], 'experiment_id');

const map = {
  schema_version: 1,
  experiment_id: args['experiment-id'],
  generated_at: new Date().toISOString(),
  mapping: {
    'candidate-x': args['x-label'] ?? 'unpublished',
    'candidate-y': args['y-label'] ?? 'unpublished',
  },
  note: 'Privado até o review cego terminar. Não publicar antes dos scores.',
};

mkdirSync(path.dirname(path.resolve(args['map-out'])), { recursive: true });
writeFileSync(path.resolve(args['map-out']), `${JSON.stringify(map, null, 2)}\n`);

function run(extra) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, extra, { stdio: 'inherit' });
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`build-review saiu ${code}`))));
  });
}

const shared = [
  path.join(here, 'build-review.mjs'),
  '--experiment-id',
  args['experiment-id'],
  '--source-build-identity',
  'unpublished-arm-identity',
  '--capture-protocol',
  args['capture-protocol'] ?? 'visual-evidence-v1',
];
if (args.pages) shared.push('--pages', args.pages);
if (args['pages-json']) shared.push('--pages-json', args['pages-json']);
if (args['capture-json-x']) {
  // capture-json é por braço e só entra no processo de build, não no mapping público
}

await run([
  ...shared,
  '--screenshots',
  args.x,
  '--out',
  path.join(args.out, 'candidate-x'),
  '--candidate-id',
  'candidate-x',
  ...(args['capture-json-x'] ? ['--capture-json', args['capture-json-x']] : []),
]);

await run([
  ...shared,
  '--screenshots',
  args.y,
  '--out',
  path.join(args.out, 'candidate-y'),
  '--candidate-id',
  'candidate-y',
  ...(args['capture-json-y'] ? ['--capture-json', args['capture-json-y']] : []),
]);

console.log(JSON.stringify({ ok: true, out: args.out, map: args['map-out'] }, null, 2));
