import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { ensureDir, copyTemplateDir, writeFile, TEMPLATES_DIR } from '../utils/file.js';
import { mergeWithConfig, getToolMap } from '../utils/config.js';

export async function initRulesCommand(options) {
  const cwd = process.cwd();
  const opts = mergeWithConfig(options, cwd);
  const tool = opts.tool || 'antigravity';
  const toolMap = getToolMap(tool);

  console.log(`\n📏 EVNICT-KIT v0.1.2: Scaffold Rules (tool: ${tool})\n`);

  // Detect if we're inside a project or workspace
  const evnictDir = join(cwd, '.evnict');
  if (!existsSync(evnictDir)) {
    console.error('❌ Chưa init workspace. Chạy "evnict-kit init" trước.');
    process.exit(1);
  }

  // Read config to find project folders
  const config = opts;
  const projects = [];
  if (config.be && existsSync(join(cwd, config.be))) projects.push({ folder: config.be, cats: ['common','backend','security','project'] });
  if (config.fe && existsSync(join(cwd, config.fe))) projects.push({ folder: config.fe, cats: ['common','frontend','security','project'] });

  for (const { folder, cats } of projects) {
    console.log(`\n── ${folder} ──`);
    for (const cat of cats) {
      const src = join(TEMPLATES_DIR, 'rules', cat);
      const dest = join(cwd, folder, toolMap.rulesDir, cat);
      if (existsSync(src)) {
        ensureDir(dest, cwd);
        copyTemplateDir(src, dest, cwd);
      }
    }
    const idxSrc = join(TEMPLATES_DIR, 'rules', 'INDEX.md');
    if (existsSync(idxSrc)) writeFile(join(cwd, folder, toolMap.rulesDir, 'INDEX.md'), readFileSync(idxSrc,'utf8'), {cwd, overwrite:true});
  }

  console.log('\n✅ Rules deployed. Next: mở Agent → /evnict-kit:init-rules\n');
}
