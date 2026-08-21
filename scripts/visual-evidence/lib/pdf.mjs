import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.on('exit', (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`${command} saiu ${code}: ${stderr || stdout}`));
    });
  });
}

export async function pdfPageCount(filePath) {
  const { stdout } = await run('pdfinfo', [filePath]);
  const match = stdout.match(/^Pages:\s+(\d+)/m);
  if (!match) throw new Error(`pdfinfo sem Pages em ${path.basename(filePath)}`);
  return Number(match[1]);
}

/** Junta PDFs sem rasterizar. pdfunite (poppler) copia os objetos. */
export async function mergePdfs(inputs, outputPath) {
  if (inputs.length === 0) throw new Error('mergePdfs: nenhum input');
  if (inputs.length === 1) {
    writeFileSync(outputPath, readFileSync(inputs[0]));
    return;
  }
  await run('pdfunite', [...inputs, outputPath]);
}

export async function mergePdfsFromBuffers(buffers, outputPath) {
  const dir = mkdtempSync(path.join(os.tmpdir(), 'visual-evidence-pdf-'));
  try {
    const files = buffers.map((buffer, index) => {
      const file = path.join(dir, `p${String(index + 1).padStart(3, '0')}.pdf`);
      writeFileSync(file, buffer);
      return file;
    });
    await mergePdfs(files, outputPath);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
