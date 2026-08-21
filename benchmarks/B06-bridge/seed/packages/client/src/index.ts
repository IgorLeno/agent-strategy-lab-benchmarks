/**
 * `@bridge/client` — the ergonomic reader/writer callers actually use.
 *
 * The client speaks **V2 field names only**. A caller asks for
 * `execution.timeout_seconds` regardless of the version of the stored
 * document; resolving that against a V1 document is the client's job.
 *
 * The client must not invent its own defaults or its own mapping: the contract
 * lives in `@bridge/core`.
 */
import { ConfigError, DEFAULTS } from '@bridge/core';
import type { AnyConfig, BackoffStrategy, ConfigV1 } from '@bridge/core';
import { ConfigApi } from '@bridge/api';

export interface ConfigHandle {
  id: string;
  version: number;
}

/** Field paths the client can read. */
export const READABLE_FIELDS: readonly string[] = [
  'version',
  'name',
  'execution.timeout_seconds',
  'execution.concurrency',
  'execution.retry.max_attempts',
  'execution.retry.backoff',
  'delivery.notify',
  'cache.enabled',
  'cache.ttl_seconds',
];

/** Field paths the client can write. */
export const WRITABLE_FIELDS: readonly string[] = [
  'name',
  'execution.timeout_seconds',
  'execution.concurrency',
  'execution.retry.max_attempts',
  'cache.enabled',
];

function unsupported(config: AnyConfig): ConfigError {
  return new ConfigError(
    'E_UNSUPPORTED_VERSION',
    `client cannot read a version ${config.version} document yet`,
  );
}

export class BridgeClient {
  readonly api: ConfigApi;

  constructor(api: ConfigApi = new ConfigApi()) {
    this.api = api;
  }

  create(raw: unknown): ConfigHandle {
    const response = this.api.create(raw);
    if (response.status !== 201) {
      const body = response.body as { code: string; message: string };
      throw new ConfigError(body.code as never, body.message.replace(/^[A-Z_]+: /, ''));
    }
    const body = response.body as { id: string; version: number };
    return { id: body.id, version: body.version };
  }

  migrate(handle: ConfigHandle): ConfigHandle {
    const response = this.api.migrate(handle.id);
    if (response.status !== 200) {
      const body = response.body as { code: string; message: string };
      throw new ConfigError(body.code as never, body.message.replace(/^[A-Z_]+: /, ''));
    }
    const body = response.body as { id: string; version: number };
    return { id: body.id, version: body.version };
  }

  /** Read one V2 field path from a stored document of any version. */
  read(handle: ConfigHandle, field: string): unknown {
    const config = this.api.read(handle.id);
    if (config.version !== 1) throw unsupported(config);
    const v1 = config as ConfigV1;
    switch (field) {
      case 'version':
        return v1.version;
      case 'name':
        return v1.name;
      case 'execution.timeout_seconds':
        return v1.timeout ?? DEFAULTS.timeout_seconds;
      case 'execution.concurrency':
        return v1.concurrency ?? DEFAULTS.concurrency;
      case 'execution.retry.max_attempts':
        return v1.retries ?? DEFAULTS.max_attempts;
      case 'execution.retry.backoff':
        return this.#backoffFor(v1.retries ?? DEFAULTS.max_attempts);
      case 'delivery.notify':
        return [...(v1.notify ?? [])];
      case 'cache.enabled':
        return v1.cache === true;
      case 'cache.ttl_seconds':
        return v1.cache === true
          ? DEFAULTS.cache_ttl_seconds_when_enabled
          : DEFAULTS.cache_ttl_seconds_when_disabled;
      default:
        throw ConfigError.invalidField(field, 'unknown field path');
    }
  }

  /** Write one V2 field path into a stored document of any version. */
  write(handle: ConfigHandle, field: string, value: unknown): ConfigHandle {
    if (!WRITABLE_FIELDS.includes(field)) {
      throw ConfigError.invalidField(field, 'field is not writable');
    }
    const config = this.api.read(handle.id);
    if (config.version !== 1) throw unsupported(config);
    const v1 = { ...(config as ConfigV1) };
    switch (field) {
      case 'name':
        v1.name = String(value);
        break;
      case 'execution.timeout_seconds':
        v1.timeout = Number(value);
        break;
      case 'execution.concurrency':
        v1.concurrency = Number(value);
        break;
      case 'execution.retry.max_attempts':
        v1.retries = Number(value);
        break;
      case 'cache.enabled':
        v1.cache = value === true || value === 'true';
        break;
      default:
        throw ConfigError.invalidField(field, 'field is not writable');
    }
    const response = this.api.replace(handle.id, v1);
    if (response.status !== 200) {
      const body = response.body as { code: string; message: string };
      throw new ConfigError(body.code as never, body.message.replace(/^[A-Z_]+: /, ''));
    }
    return { id: handle.id, version: v1.version };
  }

  /** Every readable field at once. */
  snapshot(handle: ConfigHandle): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const field of READABLE_FIELDS) {
      out[field] = this.read(handle, field);
    }
    return out;
  }

  #backoffFor(maxAttempts: number): BackoffStrategy {
    return maxAttempts > 0
      ? DEFAULTS.backoff_when_retrying
      : DEFAULTS.backoff_without_retries;
  }
}
