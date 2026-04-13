import { execSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ── Colors ──
const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  white: '\x1b[37m',
  bgGreen: '\x1b[42m',
  bgRed: '\x1b[41m',
  bgYellow: '\x1b[43m',
};

function pass(msg) { return `${c.green}+${c.reset} ${msg}`; }
function warn(msg) { return `${c.yellow}!${c.reset} ${msg}`; }
function fail(msg) { return `${c.red}x${c.reset} ${msg}`; }
function info(msg) { return `${c.cyan}i${c.reset} ${msg}`; }

function getLocalVersion() {
  try {
    const pkgPath = join(__dirname, '..', '..', 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    return pkg.version;
  } catch { return 'unknown'; }
}

function getLatestVersion() {
  try {
    const result = execSync('npm view evnict-kit version', {
      encoding: 'utf8',
      timeout: 10000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return result.trim();
  } catch {
    return null;
  }
}

function getNodeVersion() {
  return process.version;
}

function getNpmVersion() {
  try {
    return execSync('npm --version', { encoding: 'utf8', timeout: 5000, stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch { return 'unknown'; }
}

function compareVersions(v1, v2) {
  const a = v1.split('.').map(Number);
  const b = v2.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((a[i] || 0) < (b[i] || 0)) return -1;
    if ((a[i] || 0) > (b[i] || 0)) return 1;
  }
  return 0;
}

function checkWorkspace(cwd) {
  const configPath = join(cwd, '.evnict', 'config.yaml');
  if (existsSync(configPath)) {
    return { exists: true, path: configPath };
  }
  return { exists: false };
}

function checkGlobalInstall() {
  try {
    const result = execSync('npm ls -g evnict-kit --depth=0 --json', {
      encoding: 'utf8',
      timeout: 10000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    const data = JSON.parse(result);
    return data.dependencies && data.dependencies['evnict-kit'] ? true : false;
  } catch { return false; }
}

export async function doctorCommand(options) {
  const cwd = process.cwd();
  const localVersion = getLocalVersion();

  console.log('');
  console.log(`${c.bold}${c.cyan}+-------------------------------------------------+${c.reset}`);
  console.log(`${c.bold}${c.cyan}|      EVNICT-KIT Doctor  v${localVersion.padEnd(23)}|${c.reset}`);
  console.log(`${c.bold}${c.cyan}+-------------------------------------------------+${c.reset}`);
  console.log('');

  let issues = 0;
  let warnings = 0;

  // ── 1. Node.js ──
  console.log(`${c.bold}Environment${c.reset}`);
  console.log(`${c.dim}${'─'.repeat(45)}${c.reset}`);

  const nodeVer = getNodeVersion();
  const nodeMajor = parseInt(nodeVer.slice(1));
  if (nodeMajor >= 18) {
    console.log(pass(`Node.js ${c.bold}${nodeVer}${c.reset} ${c.dim}(>= 18 required)${c.reset}`));
  } else {
    console.log(fail(`Node.js ${c.bold}${nodeVer}${c.reset} -- ${c.red}need >= 18.0.0${c.reset}`));
    issues++;
  }

  // ── 2. npm ──
  const npmVer = getNpmVersion();
  console.log(pass(`npm ${c.bold}v${npmVer}${c.reset}`));

  // ── 3. Version Check ──
  console.log('');
  console.log(`${c.bold}Version${c.reset}`);
  console.log(`${c.dim}${'─'.repeat(45)}${c.reset}`);
  console.log(info(`Installed: ${c.bold}v${localVersion}${c.reset}`));

  const latestVersion = getLatestVersion();
  if (latestVersion) {
    const cmp = compareVersions(localVersion, latestVersion);
    if (cmp >= 0) {
      console.log(pass(`${c.green}Already up to date!${c.reset} ${c.dim}(latest: v${latestVersion})${c.reset}`));
    } else {
      console.log(warn(`Update available: ${c.bold}${c.yellow}v${localVersion}${c.reset} -> ${c.bold}${c.green}v${latestVersion}${c.reset}`));
      console.log(`  ${c.dim}Run: ${c.cyan}npm update -g evnict-kit${c.reset}`);
      warnings++;
    }
  } else {
    console.log(warn(`Cannot check latest version ${c.dim}(network issue?)${c.reset}`));
    warnings++;
  }

  // ── 4. Global Install ──
  const isGlobal = checkGlobalInstall();
  if (isGlobal) {
    console.log(pass(`Global install detected ${c.dim}(npm -g)${c.reset}`));
  } else {
    console.log(info(`Global install not detected ${c.dim}(may be using npx)${c.reset}`));
  }

  // ── 5. Workspace ──
  console.log('');
  console.log(`${c.bold}Workspace${c.reset}`);
  console.log(`${c.dim}${'─'.repeat(45)}${c.reset}`);
  console.log(info(`CWD: ${c.dim}${cwd}${c.reset}`));

  const ws = checkWorkspace(cwd);
  if (ws.exists) {
    console.log(pass(`Workspace config found ${c.dim}(.evnict/config.yaml)${c.reset}`));

    // Check project dirs
    try {
      const yaml = await import('js-yaml');
      const config = yaml.load(readFileSync(ws.path, 'utf8'));
      const repos = Array.isArray(config && config.repos) ? config.repos : [];
      repos.forEach(repo => {
        const repoPath = join(cwd, repo.folder);
        if (existsSync(repoPath)) {
          const hasAgent = existsSync(join(repoPath, '.agent')) || existsSync(join(repoPath, '.claude')) || existsSync(join(repoPath, '.cursor'));
          if (hasAgent) {
            console.log(pass(`${c.bold}${repo.folder}${c.reset} ${c.dim}(${repo.type}/${repo.tech}) -- Agent configured${c.reset}`));
          } else {
            console.log(warn(`${c.bold}${repo.folder}${c.reset} ${c.dim}(${repo.type}/${repo.tech})${c.reset} -- ${c.yellow}chua init-rules${c.reset}`));
            warnings++;
          }
        } else {
          console.log(fail(`${c.bold}${repo.folder}${c.reset} -- folder does not exist`));
          issues++;
        }
      });
    } catch { /* ignore yaml parse errors */ }
  } else {
    console.log(info(`No workspace here ${c.dim}(run: evnict-kit init)${c.reset}`));
  }

  // ── Summary ──
  console.log('');
  console.log(`${c.dim}${'─'.repeat(45)}${c.reset}`);
  if (issues === 0 && warnings === 0) {
    console.log(`${c.bgGreen}${c.bold}${c.white} ALL GOOD ${c.reset} Everything is working fine!`);
  } else if (issues === 0) {
    console.log(`${c.bgYellow}${c.bold}${c.white} ${warnings} WARNING${warnings > 1 ? 'S' : ''} ${c.reset} No errors, ${warnings} warning(s).`);
  } else {
    console.log(`${c.bgRed}${c.bold}${c.white} ${issues} ISSUE${issues > 1 ? 'S' : ''} ${c.reset} Need to fix ${issues} issue(s)${warnings > 0 ? ` + ${warnings} warning(s)` : ''}.`);
  }
  console.log('');
}
