// Coletor de asserções: acumula falhas e imprime um relatório determinístico.
// Sair no primeiro erro esconderia o resto do diagnóstico, que é justamente o
// insumo do único REPAIR permitido pelo protocolo.
export function createReport(title) {
  const failures = [];
  const checks = [];
  return {
    check(name, condition, detail = '') {
      const ok = Boolean(condition);
      checks.push({ name, ok, detail });
      if (!ok) failures.push(detail ? `${name}: ${detail}` : name);
      return ok;
    },
    finish() {
      console.log(`# ${title}`);
      for (const entry of checks) {
        console.log(`${entry.ok ? 'PASS' : 'FAIL'} ${entry.name}${entry.detail ? ` — ${entry.detail}` : ''}`);
      }
      console.log(`\n${checks.filter((entry) => entry.ok).length}/${checks.length} checks passed`);
      if (failures.length > 0) {
        console.error(`\n${failures.length} FAILED:`);
        for (const failure of failures) console.error(`- ${failure}`);
        process.exitCode = 1;
      }
    },
  };
}

/** Assets remotos são proibidos: o benchmark tem de rodar offline e estável. */
export function assertLocalOnly(report, label, requests, origin) {
  const external = requests.filter(
    (url) => !url.startsWith(origin) && !url.startsWith('data:') && !url.startsWith('blob:'),
  );
  report.check(`${label}: apenas assets locais`, external.length === 0, external.slice(0, 5).join(', '));
}
