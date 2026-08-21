/**
 * Every failure that crosses a package boundary is a `ConfigError`.
 *
 * The `code` is the stable part of the contract: callers switch on it, the CLI
 * prints it, and the API returns it. The message is human-facing detail.
 */
export type ConfigErrorCode =
  | 'E_NOT_OBJECT'
  | 'E_MISSING_VERSION'
  | 'E_UNSUPPORTED_VERSION'
  | 'E_INVALID_FIELD';

export class ConfigError extends Error {
  readonly code: ConfigErrorCode;
  readonly path: string | null;

  constructor(code: ConfigErrorCode, detail: string, path: string | null = null) {
    super(`${code}: ${detail}`);
    this.name = 'ConfigError';
    this.code = code;
    this.path = path;
  }

  /** `E_INVALID_FIELD: invalid value for 'execution.concurrency': expected an integer >= 1` */
  static invalidField(path: string, detail: string): ConfigError {
    return new ConfigError('E_INVALID_FIELD', `invalid value for '${path}': ${detail}`, path);
  }

  static notObject(): ConfigError {
    return new ConfigError('E_NOT_OBJECT', 'config must be a JSON object');
  }

  static missingVersion(): ConfigError {
    return new ConfigError('E_MISSING_VERSION', "config is missing the required field 'version'");
  }

  static unsupportedVersion(version: unknown): ConfigError {
    return new ConfigError(
      'E_UNSUPPORTED_VERSION',
      `unsupported config version: ${JSON.stringify(version)} (supported: 1, 2)`,
    );
  }

  toJSON(): { code: ConfigErrorCode; message: string; path: string | null } {
    return { code: this.code, message: this.message, path: this.path };
  }
}

export function isConfigError(value: unknown): value is ConfigError {
  return value instanceof ConfigError;
}
