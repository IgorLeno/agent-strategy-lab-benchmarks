// Teste de scaffold: mantém a suíte executável antes de existirem testes reais.
// Acrescente os seus próprios arquivos *.test.ts / *.test.tsx em src/.
import { describe, expect, it } from 'vitest';

describe('environment', () => {
  it('runs in a DOM environment', () => {
    expect(typeof document).toBe('object');
  });
});
