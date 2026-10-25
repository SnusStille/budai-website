/** A real Chromium browser, installed from npm (works on the restricted Arena host). */
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { tmpdir } from 'node:os';
import chromium, { inflate } from '@sparticuz/chromium';

const unitOnly = process.argv.slice(2).includes("unit.spec.ts");
const executablePath = unitOnly ? undefined : process.env.BROWSER_EXECUTABLE_PATH || await chromium.executablePath();
// Serverless Chromium needs these shared libraries on minimal Linux hosts.
if (!unitOnly && process.platform === 'linux') await inflate(path.resolve('node_modules/@sparticuz/chromium/bin/al2023.tar.br'));
const args = chromium.args.filter(arg => !['--single-process', '--in-process-gpu', '--disable-web-security', '--allow-running-insecure-content', '--disable-site-isolation-trials'].includes(arg));
// SwiftShader remains enabled for REAL WebGL; software compositing avoids a
// headless-only multi-second compositor stall that otherwise skips RAF frames.
args.push('--disable-gpu-compositing');
const result = spawnSync(process.execPath, [path.resolve('node_modules/@playwright/test/cli.js'), 'test', ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: { ...process.env, TEST_UNIT_ONLY: unitOnly ? "1" : "", BROWSER_EXECUTABLE_PATH: executablePath, BROWSER_ARGS_JSON: JSON.stringify(args), LD_LIBRARY_PATH: [path.join(tmpdir(), 'al2023/lib'), process.env.LD_LIBRARY_PATH].filter(Boolean).join(':') },
});
process.exit(result.status ?? 1);
