#!/usr/bin/env node
// Attend le déploiement Vercel du dernier commit poussé et affiche son URL de preview.
// Usage : node scripts/preview-url.mjs [sha]
// Lit l'API publique GitHub (repo public, pas de token nécessaire).
import { execSync } from 'node:child_process';

const FALLBACK_REPO = 'Clementmoro/dojo-shop-styledrop';
const TIMEOUT_MS = 5 * 60 * 1000;
const INTERVAL_MS = 10 * 1000;

function repoFromRemote() {
  try {
    const url = execSync('git remote get-url origin', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    const parts = url.replace(/\.git$/, '').split(/[/:]/).filter(Boolean);
    return `${parts.at(-2)}/${parts.at(-1)}`;
  } catch {
    return FALLBACK_REPO;
  }
}

const repo = repoFromRemote();
const sha = process.argv[2] || execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
const api = (path) =>
  fetch(`https://api.github.com/repos/${repo}${path}`, {
    headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'dojo-preview-url' },
  }).then((r) => {
    if (!r.ok) throw new Error(`GitHub API ${r.status} sur ${path}`);
    return r.json();
  });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const start = Date.now();
console.log(`Attente du déploiement Vercel de ${sha.slice(0, 7)} sur ${repo}...`);

while (Date.now() - start < TIMEOUT_MS) {
  const deployments = await api(`/deployments?sha=${sha}`);
  if (deployments.length) {
    const statuses = await api(`/deployments/${deployments[0].id}/statuses`);
    const last = statuses[0];
    if (last?.state === 'success') {
      console.log(`PREVIEW_URL=${last.environment_url || last.target_url}`);
      process.exit(0);
    }
    if (last?.state === 'failure' || last?.state === 'error') {
      console.log(`ECHEC du build Vercel : ${last.target_url || 'voir la PR ou le commit sur GitHub'}`);
      process.exit(1);
    }
  }
  await sleep(INTERVAL_MS);
}
console.log('TIMEOUT : pas de déploiement après 5 min. Vérifier que le commit est bien poussé.');
process.exit(2);
