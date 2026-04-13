import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { ensureDir, writeFile } from '../utils/file.js';
import { mergeWithConfig, getToolMap } from '../utils/config.js';

export async function initCheckCommand(options) {
  const cwd = process.cwd();
  const opts = mergeWithConfig(options, cwd);
  const toolMap = getToolMap(opts.tool || 'antigravity');

  console.log('\n🔍 EVNICT-KIT v0.1.2: Init Check\n');
  const projects = [opts.be, opts.fe].filter(f => f && existsSync(join(cwd, f)));
  for (const folder of projects) {
    const checkDir = join(cwd, folder, toolMap.agentDir, 'demo-check');
    ensureDir(checkDir, cwd);
    writeFile(join(checkDir, 'REVIEW.md'), `# Demo Check — ${folder}\nChạy /evnict-kit:init-check trong Agent để sinh demo code.\n\n## Checklist\n- [ ] Naming convention đúng?\n- [ ] Package structure đúng?\n- [ ] API format đúng?\n- [ ] Error handling đúng?\n- [ ] Test pattern đúng?\n`, { cwd, overwrite: true });
  }
  console.log('\n✅ Demo-check prepared. Mở Agent → /evnict-kit:init-check\n');
}
