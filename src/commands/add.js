import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import readline from 'node:readline';
import yaml from 'js-yaml';
import { deployToProject, createSymlinks, updateGitignore, detectTech } from './init.js';
import { loadConfig, getToolMap, TECH_LABELS, TECH_TYPE_HINTS, SUPPORTED_TOOLS } from '../utils/config.js';

/**
 * evnict-kit add <folder>
 * Thêm 1 project vào workspace đã init — deploy rules/skills/workflows + tạo symlinks
 */
export async function addCommand(folder, options) {
  const cwd = process.cwd();

  // Load existing config
  const config = loadConfig(cwd);
  if (!config) {
    console.error('❌ Không tìm thấy .evnict/config.yaml. Chạy evnict-kit init trước.');
    process.exit(1);
  }

  const name = config.project?.name;
  if (!name) {
    console.error('❌ config.yaml thiếu project.name.');
    process.exit(1);
  }

  // Check if folder exists
  const projectPath = join(cwd, folder);
  if (!existsSync(projectPath)) {
    console.error(`❌ Folder "${folder}" không tồn tại trong workspace.`);
    process.exit(1);
  }

  // Check if already in config
  const existing = config.repos?.find(r => r.folder === folder);
  if (existing) {
    console.log(`⚠️  "${folder}" đã có trong config.yaml (type: ${existing.type}). Deploy lại...`);
  }

  // Detect tech
  const detectedTech = detectTech(projectPath);
  const techLabel = detectedTech ? TECH_LABELS[detectedTech] || detectedTech : 'unknown';
  console.log(`\n📂 Folder: ${folder} (detected: ${techLabel})`);

  // Determine type and tech
  let type = options.type;
  let tech = options.tech || detectedTech;
  const tool = options.tool || config.ai_tool || 'antigravity';

  if (!SUPPORTED_TOOLS.includes(tool)) {
    console.error(`❌ Tool "${tool}" chưa có templates.`);
    process.exit(1);
  }

  // If type/tech not provided via flags, ask interactively
  if (!type) {
    const suggestedType = detectedTech ? (TECH_TYPE_HINTS[detectedTech] || 'backend') : 'backend';
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const ask = (q) => new Promise(r => rl.question(q, r));

    const typeInput = (await ask(`? Loại cho ${folder} (${techLabel}) [${suggestedType}]: `)).trim();
    type = typeInput || suggestedType;

    if (!tech) {
      const defaultTech = type === 'backend' ? 'springboot' : 'angular';
      const techInput = (await ask(`? Tech stack [${defaultTech}]: `)).trim();
      tech = techInput || defaultTech;
    }

    rl.close();
  }

  type = type || 'backend';
  tech = tech || (type === 'backend' ? 'springboot' : 'angular');
  const db = config.database?.type || 'oracle';
  const toolMap = getToolMap(tool);

  console.log(`\n🚀 Deploying evnict-kit vào ${folder} (${type}/${TECH_LABELS[tech] || tech})...\n`);

  // Build allRepos (existing + new)
  const allRepos = [...(config.repos || [])];
  if (!existing) {
    allRepos.push({ folder, type, tech });
  }

  // Deploy
  deployToProject(projectPath, cwd, {
    tool, toolMap, name, type, tech, db,
    allRepos,
  });

  // Symlinks
  createSymlinks(projectPath, cwd, name);

  // Update .gitignore
  updateGitignore(projectPath, name);

  // Update config.yaml — add new repo
  if (!existing) {
    const configPath = join(cwd, '.evnict', 'config.yaml');
    const rawConfig = yaml.load(readFileSync(configPath, 'utf8'));

    // Ensure repos is array (migration)
    if (!Array.isArray(rawConfig.repos)) {
      // Convert old format
      const repos = [];
      if (rawConfig.repos?.backend) repos.push({ folder: rawConfig.repos.backend.folder, type: 'backend', tech: rawConfig.repos.backend.tech });
      if (rawConfig.repos?.frontend) repos.push({ folder: rawConfig.repos.frontend.folder, type: 'frontend', tech: rawConfig.repos.frontend.tech });
      rawConfig.repos = repos;
    }

    rawConfig.repos.push({ folder, type, tech });
    writeFileSync(configPath, yaml.dump(rawConfig, { lineWidth: -1 }), 'utf8');
    console.log(`\n   ✅ config.yaml updated — added ${folder}`);
  }

  console.log(`
╔═══════════════════════════════════════════════════════╗
║  ✅  "${folder}" added to workspace "${name}"!         ║
╠═══════════════════════════════════════════════════════╣
║                                                       ║
║  📋 Next: Mở AI Agent trong ${folder}/                ║
║     /evnict-kit:init-rules  → điền rules              ║
║     /evnict-kit:init-context → sinh context file       ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
`);
}
