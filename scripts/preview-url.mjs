#!/usr/bin/env node
// Attend le déploiement Vercel du dernier commit poussé et affiche son URL de preview.
// Usage : node scripts/preview-url.mjs [sha]
// Sorties : PREVIEW_URL=... (code 0), ECHEC (code 1), PAS ENCORE (code 3, relancer le script).
// Lit l'API publique GitHub (repo public, pas de token nécessaire).
// Fonctionne en local comme dans un conteneur cloud derrière un proxy (claude.ai/code).
import { execFileSync, execSync, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

// Derrière un proxy, le fetch de Node l'ignore par défaut : on se relance avec le proxy activé.
const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
if (proxy && !process.env.NODE_USE_ENV_PROXY) {
  const env = { ...process.env, NODE_USE_ENV_PROXY: '1', NODE_NO_WARNINGS: '1' };
  const ca = [process.env.NODE_EXTRA_CA_CERTS, '/root/.ccr/ca-bundle.crt', process.env.SSL_CERT_FILE].find(
    (p) => p && existsSync(p)
  );
  if (ca) env.NODE_EXTRA_CA_CERTS = ca;
  const child = spawnSync(process.execPath, process.argv.slice(1), { env, stdio: 'inherit' });
  process.exit(child.status ?? 1);
}

const FALLBACK_REPO = 'Clementmoro/dojo-shop-styledrop';
// Vérification courte : une commande longue peut retarder le déclenchement de Vercel dans un
// conteneur cloud. On vérifie pendant ~1 min puis on rend la main ; il suffit de relancer.
const RUN_MS = 60 * 1000;
const INTERVAL_MS = 20 * 1000; // espacé pour rester sous la limite de l'API GitHub sans token

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
const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
const headers = { Accept: 'application/vnd.github+json', 'User-Agent': 'dojo-preview-url' };
if (token) headers.Authorization = `Bearer ${token}`;

// Plan B si fetch échoue (proxy, certificat) : curl, qui suit le proxy et les certificats du système.
function viaCurl(url) {
  const args = ['-sSf', '-H', `Accept: ${headers.Accept}`, '-H', `User-Agent: ${headers['User-Agent']}`];
  if (token) args.push('-H', `Authorization: Bearer ${token}`);
  return JSON.parse(execFileSync('curl', [...args, url], { encoding: 'utf8' }));
}

async function api(path) {
  const url = `https://api.github.com/repos/${repo}${path}`;
  try {
    const r = await fetch(url, { headers });
    if (r.ok) return r.json();
    if (r.status === 403 || r.status === 429) {
      throw new Error(`GitHub API ${r.status} (limite de requêtes ou proxy)`);
    }
    throw new Error(`GitHub API ${r.status} sur ${path}`);
  } catch (err) {
    try {
      return viaCurl(url);
    } catch {
      throw err;
    }
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const start = Date.now();
console.log(`Vérification du déploiement Vercel de ${sha.slice(0, 7)} sur ${repo}...`);

while (true) {
  try {
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
      console.log('... Vercel construit la version');
    } else {
      console.log('... Vercel n\'a pas encore démarré');
    }
  } catch (err) {
    console.log(`(nouvel essai) ${err.message}`);
  }
  if (Date.now() - start + INTERVAL_MS > RUN_MS) break;
  await sleep(INTERVAL_MS);
}
console.log('PAS ENCORE : relance le script dans quelques secondes.');
process.exit(3);
