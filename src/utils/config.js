import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import yaml from 'js-yaml';

export function loadConfig(cwd = process.cwd()) {
  const configPath = join(cwd, '.evnict', 'config.yaml');
  if (!existsSync(configPath)) return null;
  try {
    const raw = yaml.load(readFileSync(configPath, 'utf8'));
    return normalizeConfig(raw);
  } catch (e) {
    console.warn(`⚠️  Lỗi đọc config.yaml: ${e.message}`);
    return null;
  }
}

/**
 * Normalize config — hỗ trợ cả v0.1.3 (object) và v0.1.4 (array) format cho repos.
 * v0.1.3: repos: { backend: {folder, tech}, frontend: {folder, tech} }
 * v0.1.4: repos: [ {folder, type, tech}, ... ]
 */
export function normalizeConfig(config) {
  if (!config || !config.repos) return config;

  // Already v0.1.4 array format
  if (Array.isArray(config.repos)) return config;

  // v0.1.3 object format → convert to array
  const repos = [];
  if (config.repos.backend) {
    repos.push({
      folder: config.repos.backend.folder,
      type: 'backend',
      tech: config.repos.backend.tech || 'springboot',
    });
  }
  if (config.repos.frontend) {
    repos.push({
      folder: config.repos.frontend.folder,
      type: 'frontend',
      tech: config.repos.frontend.tech || 'angular',
    });
  }
  // Preserve database at top level (not in repos array)
  const database = config.repos.database || config.database;
  config.repos = repos;
  if (database) config.database = database;
  return config;
}

export function mergeWithConfig(cliOptions, cwd = process.cwd()) {
  const config = loadConfig(cwd);
  if (!config) return cliOptions;

  // Extract first backend/frontend from repos array for backward compat
  const beRepo = config.repos?.find(r => r.type === 'backend');
  const feRepo = config.repos?.find(r => r.type === 'frontend');

  return {
    name: cliOptions.name || config.project?.name,
    be: cliOptions.be || beRepo?.folder,
    fe: cliOptions.fe || feRepo?.folder,
    tool: cliOptions.tool || config.ai_tool || 'antigravity',
    techBe: cliOptions.techBe || beRepo?.tech || 'springboot',
    techFe: cliOptions.techFe || feRepo?.tech || 'angular',
    db: cliOptions.db || config.database?.type || 'oracle',
    ...cliOptions,
  };
}

export const TECH_LABELS = {
  springboot: 'Java Spring Boot',
  aspnet: 'ASP.NET Core',
  javaee: 'Java EE',
  angular: 'Angular',
  'react-web': 'React (Web)',
  'react-mobile': 'React Native (Mobile)',
  'nextjs': 'Next.js',
  'nodejs': 'Node.js',
  oracle: 'Oracle Database',
  sqlserver: 'SQL Server',
};

/**
 * Auto-detect suggested type based on tech stack
 */
export const TECH_TYPE_HINTS = {
  springboot: 'backend',
  aspnet: 'backend',
  javaee: 'backend',
  nodejs: 'backend',
  angular: 'frontend',
  'react-web': 'frontend',
  'react-mobile': 'frontend',
  'nextjs': 'frontend',
};

/**
 * Tool-specific directory and file mapping
 * Mỗi AI tool có cách tổ chức riêng — v0.2.2 Multi-Tool Support
 */
export const TOOL_MAP = {
  antigravity: {
    agentDir: '.agent',
    contextFile: 'AGENTS.md',
    rulesDir: '.agent/rules',
    skillsDir: '.agent/skills',
    workflowsDir: '.agent/workflows',
    contextDir: '.agent/context',
    ruleExt: '.md',
    deployMode: 'flat',        // flat files in dirs
  },
  claude: {
    agentDir: '.claude',
    contextFile: 'CLAUDE.md',
    rulesDir: null,            // Rules gộp TRONG CLAUDE.md, không tách file
    skillsDir: null,           // Skills = commands
    workflowsDir: '.claude/commands',  // Everything is a command
    contextDir: null,
    ruleExt: '.md',
    deployMode: 'mega-file',   // 1 big CLAUDE.md + commands/
  },
  cursor: {
    agentDir: '.cursor',
    contextFile: '.cursorrules',
    rulesDir: '.cursor/rules',
    skillsDir: null,           // Cursor không có native skills
    workflowsDir: null,        // Cursor không có native workflows
    contextDir: null,
    ruleExt: '.mdc',           // Cursor uses .mdc extension!
    deployMode: 'rules-only',  // Only rules + context
  },
  copilot: {
    agentDir: '.github',
    contextFile: '.github/copilot-instructions.md',
    rulesDir: null,            // Rules gộp trong instructions.md
    skillsDir: null,
    workflowsDir: null,
    contextDir: null,
    ruleExt: null,
    deployMode: 'single-file', // Everything in 1 file
  },
  codex: {
    agentDir: '.agent',
    contextFile: 'AGENTS.md',
    rulesDir: '.agent/rules',
    skillsDir: '.agent/skills',
    workflowsDir: '.agent/workflows',
    contextDir: '.agent/context',
    ruleExt: '.md',
    deployMode: 'flat',        // Same as antigravity
  },
};

/**
 * Tools that have templates ready — v0.2.2: ALL 5 tools supported
 */
export const SUPPORTED_TOOLS = ['antigravity', 'claude', 'cursor', 'copilot', 'codex'];

export function getToolMap(tool) {
  const map = TOOL_MAP[tool];
  if (!map) {
    console.error(`❌ Tool "${tool}" chưa hỗ trợ. Chọn: ${Object.keys(TOOL_MAP).join('|')}`);
    process.exit(1);
  }
  return map;
}
