import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline';

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
};

function getLocalVersion() {
  try {
    const pkgPath = join(__dirname, '..', '..', 'package.json');
    return JSON.parse(readFileSync(pkgPath, 'utf8')).version;
  } catch { return 'unknown'; }
}

function getLatestVersion() {
  try {
    return execSync('npm view evnict-kit version', {
      encoding: 'utf8', timeout: 10000, stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
  } catch { return null; }
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

function prompt(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

export async function upgradeCommand(options) {
  const localVersion = getLocalVersion();

  console.log('');
  console.log(`${c.bold}${c.cyan}EVNICT-KIT Upgrade${c.reset}`);
  console.log(`${c.dim}${'='.repeat(45)}${c.reset}`);
  console.log(`  Current version: ${c.bold}v${localVersion}${c.reset}`);
  console.log(`  Checking npm registry...`);

  const latestVersion = getLatestVersion();

  if (!latestVersion) {
    console.log(`  ${c.red}x${c.reset} Cannot connect to npm registry.`);
    console.log(`  ${c.dim}Check your network and try again.${c.reset}`);
    console.log('');
    return;
  }

  console.log(`  Latest version:  ${c.bold}v${latestVersion}${c.reset}`);
  console.log('');

  const cmp = compareVersions(localVersion, latestVersion);
  if (cmp >= 0) {
    console.log(`  ${c.green}+${c.reset} ${c.bold}You are on the latest version!${c.reset}`);
    console.log('');
    return;
  }

  console.log(`  ${c.yellow}!${c.reset} Update available: ${c.yellow}v${localVersion}${c.reset} -> ${c.green}${c.bold}v${latestVersion}${c.reset}`);
  console.log('');

  if (options.yes) {
    doUpgrade(latestVersion);
    return;
  }

  const answer = await prompt(`  Upgrade now? ${c.dim}(y/N)${c.reset} `);
  if (answer === 'y' || answer === 'yes') {
    doUpgrade(latestVersion);
  } else {
    console.log('');
    console.log(`  ${c.dim}Skipped. Run anytime:${c.reset}`);
    console.log(`  ${c.cyan}npm update -g evnict-kit${c.reset}`);
    console.log('');
  }
}

function doUpgrade(targetVersion) {
  console.log('');
  console.log(`  ${c.cyan}Upgrading...${c.reset}`);
  console.log(`  ${c.dim}$ npm install -g evnict-kit@latest${c.reset}`);
  console.log('');

  try {
    execSync('npm install -g evnict-kit@latest', {
      stdio: 'inherit',
      timeout: 60000,
    });
    console.log('');
    console.log(`  ${c.green}+${c.reset} ${c.bold}Upgraded successfully -> v${targetVersion}${c.reset}`);
    console.log('');
    console.log(`  ${c.yellow}!${c.reset} ${c.bold}Quan trọng:${c.reset} Chạy lệnh sau để cập nhật templates vào các project:`);
    console.log(`  ${c.cyan}  cd <workspace-folder>${c.reset}`);
    console.log(`  ${c.cyan}  evnict-kit sync${c.reset}`);
    console.log('');
    console.log(`  ${c.dim}Lệnh sync sẽ ghi đè workflows/skills/rules mới,${c.reset}`);
    console.log(`  ${c.dim}nhưng giữ nguyên files bạn tự thêm.${c.reset}`);
    console.log('');
  } catch (e) {
    console.log('');
    console.log(`  ${c.red}x${c.reset} Upgrade failed.`);
    console.log(`  ${c.dim}Try manually: ${c.cyan}npm install -g evnict-kit@latest${c.reset}`);
    console.log('');
  }
}
