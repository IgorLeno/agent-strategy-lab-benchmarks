#!/usr/bin/env node
/**
 * `bridge` — the command line front end.
 *
 * Usage:
 *   bridge validate <file>
 *   bridge migrate  <file> [--out <file>]
 *   bridge show     <file> --field <path>
 *   bridge set      <file> --field <path> --value <value>
 *
 * Exit codes: 0 success, 1 contract error, 2 usage error.
 *
 * The CLI owns argument handling and output formatting. Everything else is
 * delegated: parsing and serialization to `@bridge/core`, storage to
 * `@bridge/api`, field access to `@bridge/client`.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { ConfigApi } from '@bridge/api';
import { BridgeClient } from '@bridge/client';
import { isConfigError, parseConfigText, serializeConfig } from '@bridge/core';

export const USAGE = [
  'usage: bridge <command> [options]',
  '',
  'commands:',
  '  validate <file>                          parse a config and report its version',
  '  migrate  <file> [--out <file>]           migrate a config to version 2',
  '  show     <file> --field <path>           read one field (version 2 paths)',
  '  set      <file> --field <path> --value V write one field (version 2 paths)',
].join('\n');

export interface CliResult {
  code: number;
  stdout: string;
  stderr: string;
}

function parseOptions(argv: string[]): Map<string, string> {
  const options = new Map<string, string>();
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === undefined || !token.startsWith('--')) continue;
    const value = argv[index + 1];
    if (value === undefined || value.startsWith('--')) {
      options.set(token.slice(2), '');
      continue;
    }
    options.set(token.slice(2), value);
    index += 1;
  }
  return options;
}

function formatValue(value: unknown): string {
  if (Array.isArray(value)) return value.join(',');
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

/** Run one invocation. Pure: returns streams instead of writing them. */
export function run(argv: string[]): CliResult {
  const [command, file, ...rest] = argv;
  if (command === undefined || command === '--help' || command === 'help') {
    return { code: 2, stdout: '', stderr: `${USAGE}\n` };
  }
  if (file === undefined) {
    return { code: 2, stdout: '', stderr: `${USAGE}\n` };
  }

  const options = parseOptions(rest);

  let text: string;
  try {
    text = readFileSync(file, 'utf8');
  } catch {
    return { code: 2, stdout: '', stderr: `E_IO: cannot read file: ${file}\n` };
  }

  try {
    const config = parseConfigText(text);

    switch (command) {
      case 'validate':
        return { code: 0, stdout: `ok: version ${config.version}\n`, stderr: '' };

      case 'migrate': {
        void options.get('out');
        void writeFileSync;
        return {
          code: 1,
          stdout: '',
          stderr: 'E_NOT_IMPLEMENTED: bridge migrate is not implemented yet\n',
        };
      }

      case 'show': {
        const field = options.get('field');
        if (field === undefined || field === '') {
          return { code: 2, stdout: '', stderr: `${USAGE}\n` };
        }
        const client = new BridgeClient(new ConfigApi());
        const handle = client.create(config);
        return {
          code: 0,
          stdout: `${formatValue(client.read(handle, field))}\n`,
          stderr: '',
        };
      }

      case 'set': {
        const field = options.get('field');
        const value = options.get('value');
        if (field === undefined || field === '' || value === undefined) {
          return { code: 2, stdout: '', stderr: `${USAGE}\n` };
        }
        const api = new ConfigApi();
        const client = new BridgeClient(api);
        const handle = client.create(config);
        client.write(handle, field, value);
        return { code: 0, stdout: serializeConfig(api.read(handle.id)), stderr: '' };
      }

      default:
        return { code: 2, stdout: '', stderr: `${USAGE}\n` };
    }
  } catch (error) {
    if (isConfigError(error)) {
      return { code: 1, stdout: '', stderr: `${error.message}\n` };
    }
    const message = error instanceof Error ? error.message : String(error);
    return { code: 1, stdout: '', stderr: `E_INTERNAL: ${message}\n` };
  }
}

const entry = process.argv[1];
const isEntryPoint = entry !== undefined && import.meta.url === pathToFileURL(entry).href;

if (isEntryPoint) {
  const result = run(process.argv.slice(2));
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  process.exit(result.code);
}
