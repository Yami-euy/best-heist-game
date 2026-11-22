// main.ts — hands The Star of Merdeka in for the make.fun heist bounty.
// Node 22, stdlib only. It copies game/ and screenshots/ from this
// repository into the output directory, then writes the dossier that
// vendor/makefun-game.ts builds from those copied files.
//
// Run it as:  MAKEFUN_OUTPUT_DIR=/output node main.ts
// (MAKEFUN_OUTPUT_DIR defaults to /output when it is not set.)

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { buildDossier } from './vendor/makefun-game.ts';

const DOSSIER_OPTIONS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

function fail(message: string): never {
  throw new Error(`main.ts: ${message}`);
}

function outputDir(): string {
  const fromEnv = process.env.MAKEFUN_OUTPUT_DIR;
  return resolve(fromEnv && fromEnv.length > 0 ? fromEnv : '/output');
}

function repoRoot(): string {
  return resolve(new URL('.', import.meta.url).pathname);
}

function mustBeReadableDir(path: string, label: string): void {
  if (!existsSync(path)) fail(`${label} is missing at ${path}`);
  if (!statSync(path).isDirectory()) fail(`${label} at ${path} is not a directory`);
}

function countEntries(dir: string): number {
  let total = 0;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    total += 1;
    if (statSync(p).isDirectory()) total += countEntries(p);
  }
  return total;
}

function main(): void {
  const out = outputDir();
  const root = repoRoot();
  const gameSrc = join(root, 'game');
  const shotsSrc = join(root, 'screenshots');

  mustBeReadableDir(gameSrc, 'game/');
  mustBeReadableDir(shotsSrc, 'screenshots/');
  const indexHtml = join(gameSrc, 'index.html');
  if (!existsSync(indexHtml)) fail('game/index.html is missing');

  const shotFiles = readdirSync(shotsSrc).filter((n) => !n.startsWith('.'));
  if (shotFiles.length < 3 || shotFiles.length > 4) {
    fail(`screenshots/ holds ${shotFiles.length} images, need 3 or 4`);
  }
  for (const name of shotFiles) {
    const p = join(shotsSrc, name);
    if (!statSync(p).isFile()) fail(`screenshots/${name} is not a regular file`);
    if (statSync(p).size > 262144) fail(`screenshots/${name} is over the 256 KiB cap`);
  }

  mkdirSync(out, { recursive: true });
  cpSync(gameSrc, join(out, 'game'), { recursive: true });
  cpSync(shotsSrc, join(out, 'screenshots'), { recursive: true });

  const gameEntries = countEntries(join(out, 'game'));
  console.log(`copied game/ (${gameEntries} entries) and screenshots/ (${shotFiles.length} images) to ${out}`);

  const dossier = buildDossier(out, DOSSIER_OPTIONS);
  // buildDossier returns a Uint8Array (not a string) — check its length.
  if (!(dossier instanceof Uint8Array) || dossier.length === 0) {
    fail('buildDossier returned an empty dossier');
  }
  const dossierPath = join(out, 'dossier.json');
  writeFileSync(dossierPath, dossier);
  console.log(`wrote ${dossierPath} (${dossier.length} bytes)`);
}

main();
