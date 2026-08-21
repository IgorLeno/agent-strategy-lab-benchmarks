/**
 * `@bridge/api` — the transport-independent service layer.
 *
 * Every operation returns an `ApiResponse`: a status and a body. Nothing here
 * throws across the boundary; `ConfigError` is translated into a 400 with the
 * stable error code, and an unknown id into a 404.
 *
 * The API never reimplements contract rules. Parsing, serialization and
 * migration all come from `@bridge/core`.
 */
import {
  ConfigError,
  isConfigError,
  needsMigration,
  parseConfig,
  toCanonicalObject,
} from '@bridge/core';
import type { AnyConfig } from '@bridge/core';

export interface ApiResponse<T = unknown> {
  status: number;
  body: T;
}

export interface ConfigBody {
  id: string;
  version: number;
  config: Record<string, unknown>;
}

export interface ErrorBody {
  code: string;
  message: string;
  path: string | null;
}

export interface MigrateBody extends ConfigBody {
  migrated: boolean;
}

function errorResponse(error: unknown): ApiResponse<ErrorBody> {
  if (isConfigError(error)) {
    return { status: 400, body: error.toJSON() };
  }
  const message = error instanceof Error ? error.message : String(error);
  return { status: 500, body: { code: 'E_INTERNAL', message, path: null } };
}

function notFound(id: string): ApiResponse<ErrorBody> {
  return {
    status: 404,
    body: { code: 'E_NOT_FOUND', message: `unknown config id: ${id}`, path: null },
  };
}

/** In-memory config service. */
export class ConfigApi {
  /**
   * Contract versions this service accepts.
   *
   * This is a service policy, not a parser capability: the parser may know how
   * to read a version that the service has not been cleared to store yet.
   */
  static readonly SUPPORTED_VERSIONS: readonly number[] = [1];

  #store = new Map<string, AnyConfig>();
  #sequence = 0;

  #rejectUnsupported(version: number): ApiResponse<ErrorBody> | null {
    if (ConfigApi.SUPPORTED_VERSIONS.includes(version)) return null;
    return errorResponse(
      new ConfigError(
        'E_UNSUPPORTED_VERSION',
        `this service does not accept version ${version} documents ` +
          `(accepted: ${ConfigApi.SUPPORTED_VERSIONS.join(', ')})`,
      ),
    );
  }

  /** POST /configs — parse and store a document as submitted. */
  create(raw: unknown): ApiResponse<ConfigBody | ErrorBody> {
    let config: AnyConfig;
    try {
      config = parseConfig(raw);
    } catch (error) {
      return errorResponse(error);
    }
    const rejected = this.#rejectUnsupported(config.version);
    if (rejected !== null) return rejected;
    this.#sequence += 1;
    const id = `cfg-${String(this.#sequence).padStart(4, '0')}`;
    this.#store.set(id, config);
    return { status: 201, body: this.#body(id, config) };
  }

  /** GET /configs/:id */
  get(id: string): ApiResponse<ConfigBody | ErrorBody> {
    const config = this.#store.get(id);
    if (config === undefined) return notFound(id);
    return { status: 200, body: this.#body(id, config) };
  }

  /** GET /configs */
  list(): ApiResponse<{ ids: string[] }> {
    return { status: 200, body: { ids: [...this.#store.keys()].sort() } };
  }

  /** POST /configs/validate — parse without storing. */
  validate(raw: unknown): ApiResponse<{ valid: true; version: number } | ErrorBody> {
    try {
      const config = parseConfig(raw);
      const rejected = this.#rejectUnsupported(config.version);
      if (rejected !== null) return rejected;
      return { status: 200, body: { valid: true, version: config.version } };
    } catch (error) {
      return errorResponse(error);
    }
  }

  /** POST /configs/:id/migrate — migrate the stored document to V2 in place. */
  migrate(id: string): ApiResponse<MigrateBody | ErrorBody> {
    const config = this.#store.get(id);
    if (config === undefined) return notFound(id);
    void needsMigration(config);
    return {
      status: 501,
      body: {
        code: 'E_NOT_IMPLEMENTED',
        message: 'E_NOT_IMPLEMENTED: this service cannot migrate documents yet',
        path: null,
      },
    };
  }

  /** Raw access for callers that already hold an id. Throws on unknown id. */
  read(id: string): AnyConfig {
    const config = this.#store.get(id);
    if (config === undefined) {
      throw new ConfigError('E_INVALID_FIELD', `unknown config id: ${id}`, 'id');
    }
    return config;
  }

  /** Replace a stored document with an already-parsed one. */
  replace(id: string, config: AnyConfig): ApiResponse<ConfigBody | ErrorBody> {
    if (!this.#store.has(id)) return notFound(id);
    this.#store.set(id, config);
    return { status: 200, body: this.#body(id, config) };
  }

  #body(id: string, config: AnyConfig): ConfigBody {
    return { id, version: config.version, config: toCanonicalObject(config) };
  }
}
