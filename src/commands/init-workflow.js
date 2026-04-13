import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { ensureDir, copyTemplateDir, TEMPLATES_DIR } from '../utils/file.js';
import { mergeWithConfig, getToolMap } from '../utils/config.js';

export async function initWorkflowCommand(options) {
  const cwd = process.cwd();
  const opts = mergeWithConfig(options, cwd);
  const tool = opts.tool || 'antigravity';
  const toolMap = getToolMap(tool);

  console.log(`\n🔄 EVNICT-KIT v0.1.2: Scaffold Workflows & Skills (tool: ${tool})\n`);

  const projects = [opts.be, opts.fe].filter(f => f && existsSync(join(cwd, f)));
  for (const folder of projects) {
    console.log(`── ${folder} ──`);
    // Workflows
    for (const cat of ['init','work']) {
      const src = join(TEMPLATES_DIR, 'workflows', cat);
      const dest = join(cwd, folder, toolMap.workflowsDir, cat);
      if (existsSync(src)) { ensureDir(dest,cwd); copyTemplateDir(src,dest,cwd); }
    }
    // Skills
    const skillsSrc = join(TEMPLATES_DIR, 'skills');
    if (existsSync(skillsSrc)) {
      for (const d of readdirSync(skillsSrc, {withFileTypes:true})) {
        if (d.isDirectory()) {
          const dest = join(cwd, folder, toolMap.skillsDir, d.name);
          ensureDir(dest,cwd);
          copyTemplateDir(join(skillsSrc,d.name), dest, cwd);
        }
      }
    }
  }
  console.log('\n✅ Workflows + Skills deployed.\n');
}
