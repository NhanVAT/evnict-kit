import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ensureDir, writeFile, TEMPLATES_DIR } from '../utils/file.js';
import { mergeWithConfig, getToolMap, TECH_LABELS } from '../utils/config.js';

export async function initContextCommand(options) {
  const cwd = process.cwd();
  const opts = mergeWithConfig(options, cwd);
  const tool = opts.tool || 'antigravity';
  const toolMap = getToolMap(tool);

  console.log(`\n📋 EVNICT-KIT v0.1.2: Scaffold Context (tool: ${tool})\n`);

  const evnictDir = join(cwd, '.evnict');
  if (!existsSync(evnictDir)) { console.error('❌ Chạy "evnict-kit init" trước.'); process.exit(1); }

  const ctxMap = { antigravity:'AGENT.md.template', claude:'CLAUDE.md.template', cursor:'cursorrules.template', copilot:'AGENT.md.template', codex:'AGENT.md.template' };
  const projects = [
    { folder: opts.be, tech: opts.techBe, type: 'backend' },
    { folder: opts.fe, tech: opts.techFe, type: 'frontend' },
  ];

  for (const { folder, tech, type } of projects) {
    if (!folder || !existsSync(join(cwd, folder))) continue;
    console.log(`── ${folder} ──`);
    const tplPath = join(TEMPLATES_DIR, 'context', ctxMap[tool]);
    if (existsSync(tplPath)) {
      let content = readFileSync(tplPath, 'utf8')
        .replaceAll('{{PROJECT_NAME}}', opts.name || '')
        .replaceAll('{{TECH_STACK}}', TECH_LABELS[tech] || tech)
        .replaceAll('{{DATABASE}}', TECH_LABELS[opts.db] || opts.db || '');
      writeFile(join(cwd, folder, toolMap.contextFile), content, { cwd });
    }
    ensureDir(join(cwd, folder, toolMap.contextDir), cwd);
  }
  console.log('\n✅ Context scaffolded. Next: mở Agent → /evnict-kit:init-context\n');
}
