import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SUPPORTED_TOOLS, TECH_LABELS, TOOL_MAP } from '../utils/config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEMPLATES_DIR = join(__dirname, '..', '..', 'templates');

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
  blue: '\x1b[34m',
};

function getVersion() {
  try {
    const pkgPath = join(__dirname, '..', '..', 'package.json');
    return JSON.parse(readFileSync(pkgPath, 'utf8')).version;
  } catch { return 'unknown'; }
}

function countDir(dir, countType) {
  if (!existsSync(dir)) return 0;
  try {
    const items = readdirSync(dir);
    if (countType === 'dirs') {
      return items.filter(i => statSync(join(dir, i)).isDirectory()).length;
    }
    return items.filter(i => statSync(join(dir, i)).isFile()).length;
  } catch { return 0; }
}

function listDir(dir, countType) {
  if (!existsSync(dir)) return [];
  try {
    const items = readdirSync(dir);
    if (countType === 'dirs') {
      return items.filter(i => statSync(join(dir, i)).isDirectory());
    }
    return items.filter(i => statSync(join(dir, i)).isFile());
  } catch { return []; }
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function totalSize(dir) {
  if (!existsSync(dir)) return 0;
  let total = 0;
  try {
    const walk = (d) => {
      for (const item of readdirSync(d)) {
        const p = join(d, item);
        const st = statSync(p);
        if (st.isFile()) total += st.size;
        else if (st.isDirectory()) walk(p);
      }
    };
    walk(dir);
  } catch { /* ignore */ }
  return total;
}

export async function infoCommand(options) {
  const version = getVersion();
  const contentDir = join(TEMPLATES_DIR, 'content');

  // Count assets
  const rulesCount = countDir(join(contentDir, 'rules'));
  const skillsCount = countDir(join(contentDir, 'skills'), 'dirs');
  const workflowsCount = countDir(join(contentDir, 'workflows'));
  const toolsCount = SUPPORTED_TOOLS.length;

  // Skill names
  const skillNames = listDir(join(contentDir, 'skills'), 'dirs')
    .map(s => s.replace('evnict-kit-', ''));

  // Workflow names
  const workflowNames = listDir(join(contentDir, 'workflows'))
    .map(w => w.replace('evnict-kit-', '').replace('.md', ''));

  // Rule names
  const ruleNames = listDir(join(contentDir, 'rules'))
    .map(r => r.replace(/^\d+-evnict-kit-/, '').replace('.md', ''));

  // Template size
  const templatesSize = totalSize(TEMPLATES_DIR);

  console.log('');
  console.log(`${c.bold}${c.magenta}+===================================================+${c.reset}`);
  console.log(`${c.bold}${c.magenta}|       EVNICT-KIT Info  v${version.padEnd(26)}|${c.reset}`);
  console.log(`${c.bold}${c.magenta}|   AI-Assisted Development Toolkit                 |${c.reset}`);
  console.log(`${c.bold}${c.magenta}+===================================================+${c.reset}`);

  // ── Overview ──
  console.log('');
  console.log(`${c.bold}${c.cyan}  Overview${c.reset}`);
  console.log(`${c.dim}  ${'='.repeat(45)}${c.reset}`);
  console.log(`  ${c.bold}Version:${c.reset}      v${version}`);
  console.log(`  ${c.bold}Node:${c.reset}         ${process.version}`);
  console.log(`  ${c.bold}Platform:${c.reset}     ${process.platform} (${process.arch})`);
  console.log(`  ${c.bold}Bundle Size:${c.reset}  ${formatBytes(templatesSize)} ${c.dim}(templates)${c.reset}`);
  console.log(`  ${c.bold}License:${c.reset}      UNLICENSED (EVNICT internal)`);

  // ── Stats ──
  console.log('');
  console.log(`${c.bold}${c.cyan}  Asset Inventory${c.reset}`);
  console.log(`${c.dim}  ${'='.repeat(45)}${c.reset}`);
  console.log(`  ${c.green}*${c.reset} Rule Sets       ${c.bold}${rulesCount}${c.reset}  ${c.dim}${ruleNames.join(', ')}${c.reset}`);
  console.log(`  ${c.blue}*${c.reset} Skills          ${c.bold}${skillsCount}${c.reset} ${c.dim}specialized agent capabilities${c.reset}`);
  console.log(`  ${c.yellow}*${c.reset} Workflows       ${c.bold}${workflowsCount}${c.reset} ${c.dim}step-by-step agent processes${c.reset}`);
  console.log(`  ${c.magenta}*${c.reset} AI Tools        ${c.bold}${toolsCount}${c.reset}  ${c.dim}${SUPPORTED_TOOLS.join(', ')}${c.reset}`);

  // ── Skills Detail ──
  console.log('');
  console.log(`${c.bold}${c.cyan}  Skills (${skillsCount})${c.reset}`);
  console.log(`${c.dim}  ${'='.repeat(45)}${c.reset}`);

  const skillGroups = {
    'Development': ['create-api', 'create-component', 'create-page', 'database-migration'],
    'Quality':     ['code-review', 'tdd', 'bug-fix', 'fix-business-logic', 'fix-attt'],
    'Process':     ['brainstorm', 'spec', 'checkpoint', 'coordinate', 'prompt-standard'],
    'Git':         ['finish-branch', 'merge-checklist', 'git-worktrees', 'receiving-review'],
    'Knowledge':   ['wiki', 'onboard', 'doc-postmortem', 'security-audit'],
  };

  for (const [group, skills] of Object.entries(skillGroups)) {
    const matched = skills.filter(s => skillNames.includes(s));
    if (matched.length > 0) {
      console.log(`  ${c.bold}${group}:${c.reset} ${matched.map(s => `${c.dim}${s}${c.reset}`).join(' | ')}`);
    }
  }

  // ── Workflows Detail ──
  console.log('');
  console.log(`${c.bold}${c.cyan}  Workflows (${workflowsCount})${c.reset}`);
  console.log(`${c.dim}  ${'='.repeat(45)}${c.reset}`);

  const wfGroups = {
    'Setup':     ['init-rules', 'init-context', 'init-check', 'init-wiki'],
    'Feature':   ['feature-large', 'feature-small', 'plan', 'implement'],
    'Quality':   ['review', 'bug-fix', 'attt'],
    'Knowledge': ['wiki-scan-project', 'wiki-archive-feature', 'wiki-query', 'archive-wiki', 'spec-archive'],
    'Collab':    ['handoff'],
  };

  for (const [group, wfs] of Object.entries(wfGroups)) {
    const matched = wfs.filter(w => workflowNames.includes(w));
    if (matched.length > 0) {
      console.log(`  ${c.bold}${group}:${c.reset} ${matched.map(w => `${c.dim}${w}${c.reset}`).join(' | ')}`);
    }
  }

  // ── Tool Support ──
  console.log('');
  console.log(`${c.bold}${c.cyan}  Multi-Tool Support${c.reset}`);
  console.log(`${c.dim}  ${'='.repeat(45)}${c.reset}`);

  for (const tool of SUPPORTED_TOOLS) {
    const map = TOOL_MAP[tool];
    const label = tool === 'antigravity' ? `${tool} ${c.green}(default)${c.reset}` : tool;
    console.log(`  ${c.bold}${label}${c.reset}`);
    console.log(`    ${c.dim}Dir: ${map.agentDir} | Context: ${map.contextFile} | Mode: ${map.deployMode}${c.reset}`);
  }

  // ── Tech Stacks ──
  console.log('');
  console.log(`${c.bold}${c.cyan}  Supported Tech Stacks${c.reset}`);
  console.log(`${c.dim}  ${'='.repeat(45)}${c.reset}`);
  console.log(`  ${c.bold}Backend:${c.reset}  ${c.dim}Spring Boot | ASP.NET Core | Java EE${c.reset}`);
  console.log(`  ${c.bold}Frontend:${c.reset} ${c.dim}Angular | React Web | React Native${c.reset}`);
  console.log(`  ${c.bold}Database:${c.reset} ${c.dim}Oracle | SQL Server${c.reset}`);

  console.log('');
  console.log(`${c.dim}  Run ${c.cyan}evnict-kit doctor${c.dim} to check for updates.${c.reset}`);
  console.log('');
}
