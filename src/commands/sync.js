import { existsSync, readFileSync, readdirSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import readline from 'node:readline';
import { loadConfig, getToolMap, TECH_LABELS, SUPPORTED_TOOLS } from '../utils/config.js';
import { ensureDir, writeFile, TEMPLATES_DIR } from '../utils/file.js';

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

// ════════════════════════════════════════════════════════════════════
// Detect evnict-kit managed files vs user files
// evnict-kit files always start with "evnict-kit-" prefix
// or numbered prefix like "01-evnict-kit-", "02-evnict-kit-"
// ════════════════════════════════════════════════════════════════════

function isEvnictKitFile(filename) {
  return filename.startsWith('evnict-kit-') ||
         /^\d{2}-evnict-kit-/.test(filename);
}

function isEvnictKitSkillDir(dirname) {
  return dirname.startsWith('evnict-kit-');
}

// ════════════════════════════════════════════════════════════════════
// Sync templates into a project — overwrite evnict-kit files only
// ════════════════════════════════════════════════════════════════════

function syncRules(projectPath, cwd, tool, toolMap) {
  const rulesSrc = join(TEMPLATES_DIR, 'rules', tool);
  const rulesDest = join(projectPath, toolMap.rulesDir);
  if (!existsSync(rulesSrc) || !toolMap.rulesDir) return { updated: 0, skipped: 0, userFiles: [] };

  ensureDir(rulesDest, cwd);
  const srcFiles = readdirSync(rulesSrc).filter(f => f.endsWith('.md') || f.endsWith('.mdc'));
  let updated = 0, skipped = 0;
  const userFiles = [];

  // Detect user files in dest
  if (existsSync(rulesDest)) {
    const destFiles = readdirSync(rulesDest).filter(f => !f.startsWith('.'));
    for (const f of destFiles) {
      if (!isEvnictKitFile(f) && !srcFiles.includes(f)) {
        userFiles.push(f);
      }
    }
  }

  // Overwrite evnict-kit rules
  for (const file of srcFiles) {
    const content = readFileSync(join(rulesSrc, file), 'utf8');
    const destPath = join(rulesDest, file);
    const existed = existsSync(destPath);
    writeFile(destPath, content, { overwrite: true, cwd, silent: true });
    if (existed) {
      updated++;
      console.log(`      🔄 ${file}`);
    } else {
      updated++;
      console.log(`      ✨ ${file} (new)`);
    }
  }

  return { updated, skipped, userFiles };
}

function syncWorkflows(projectPath, cwd, tool, toolMap) {
  const wfSrc = join(TEMPLATES_DIR, 'workflows', tool);
  const wfDest = join(projectPath, toolMap.workflowsDir);
  if (!existsSync(wfSrc) || !toolMap.workflowsDir) return { updated: 0, skipped: 0, userFiles: [] };

  ensureDir(wfDest, cwd);
  const srcFiles = readdirSync(wfSrc).filter(f => f.endsWith('.md'));
  let updated = 0;
  const userFiles = [];

  // Detect user files in dest
  if (existsSync(wfDest)) {
    const destFiles = readdirSync(wfDest).filter(f => f.endsWith('.md'));
    for (const f of destFiles) {
      if (!isEvnictKitFile(f) && !srcFiles.includes(f) && f !== 'README.md') {
        userFiles.push(f);
      }
    }
  }

  for (const file of srcFiles) {
    const content = readFileSync(join(wfSrc, file), 'utf8');
    const destPath = join(wfDest, file);
    const existed = existsSync(destPath);
    writeFile(destPath, content, { overwrite: true, cwd, silent: true });
    if (existed) {
      updated++;
      console.log(`      🔄 ${file}`);
    } else {
      updated++;
      console.log(`      ✨ ${file} (new)`);
    }
  }

  return { updated, userFiles };
}

function syncSkills(projectPath, cwd, toolMap) {
  const skillsSrc = join(TEMPLATES_DIR, 'skills');
  if (!existsSync(skillsSrc) || !toolMap.skillsDir) return { updated: 0, newSkills: 0, userSkills: [] };

  const srcDirs = readdirSync(skillsSrc, { withFileTypes: true })
    .filter(d => d.isDirectory());
  let updated = 0, newSkills = 0;
  const userSkills = [];

  // Detect user skills in dest
  const skillsDest = join(projectPath, toolMap.skillsDir);
  if (existsSync(skillsDest)) {
    const destDirs = readdirSync(skillsDest, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);
    const srcNames = srcDirs.map(d => d.name);
    for (const d of destDirs) {
      if (!srcNames.includes(d) && !isEvnictKitSkillDir(d)) {
        userSkills.push(d);
      }
    }
  }

  for (const d of srcDirs) {
    const dest = join(projectPath, toolMap.skillsDir, d.name);
    const existed = existsSync(dest);
    ensureDir(dest, cwd);

    // Overwrite all files in skill dir
    const skillFiles = readdirSync(join(skillsSrc, d.name), { withFileTypes: true });
    for (const entry of skillFiles) {
      if (entry.isFile()) {
        const content = readFileSync(join(skillsSrc, d.name, entry.name), 'utf8');
        writeFile(join(dest, entry.name), content, { overwrite: true, cwd, silent: true });
      }
    }

    if (existed) {
      updated++;
      console.log(`      🔄 ${d.name}/`);
    } else {
      newSkills++;
      console.log(`      ✨ ${d.name}/ (new)`);
    }
  }

  return { updated, newSkills, userSkills };
}

function syncSharedFiles(projectPath, cwd, toolMap) {
  let updated = 0;

  // GETTING-STARTED.md
  const guideTemplate = join(TEMPLATES_DIR, 'GETTING-STARTED.md');
  if (existsSync(guideTemplate)) {
    const guideDest = join(projectPath, 'GETTING-STARTED.md');
    if (existsSync(guideDest)) {
      const content = readFileSync(guideTemplate, 'utf8');
      // Preserve {{}} placeholders — user may have customized
      writeFile(guideDest, content, { overwrite: true, cwd, silent: true });
      console.log(`      🔄 GETTING-STARTED.md`);
      updated++;
    }
  }

  return { updated };
}

// ════════════════════════════════════════════════════════════════════
// Main sync command
// ════════════════════════════════════════════════════════════════════

export async function syncCommand(options) {
  const cwd = process.cwd();

  // Load config
  const config = loadConfig(cwd);
  if (!config) {
    console.error('❌ Không tìm thấy .evnict/config.yaml. Chạy evnict-kit init trước.');
    process.exit(1);
  }

  const name = config.project?.name;
  const tool = config.ai_tool || 'antigravity';
  const repos = config.repos || [];

  if (!SUPPORTED_TOOLS.includes(tool)) {
    console.error(`❌ Tool "${tool}" chưa hỗ trợ.`);
    process.exit(1);
  }

  const toolMap = getToolMap(tool);
  const pkgPath = join(__dirname, '..', '..', 'package.json');
  const version = JSON.parse(readFileSync(pkgPath, 'utf8')).version;

  console.log(`
${c.bold}${c.cyan}╔═══════════════════════════════════════════════════════╗
║         🔄 EVNICT-KIT v${version}: Sync Templates         ║
╚═══════════════════════════════════════════════════════╝${c.reset}

   Project: ${c.bold}${name}${c.reset}
   Tool:    ${tool} → ${toolMap.agentDir}/
   Repos:   ${repos.map(r => r.folder).join(', ')}
`);

  // Confirm unless --yes
  if (!options.yes) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const answer = await new Promise(r => rl.question(
      `${c.yellow}⚠️  Sync sẽ GHI ĐÈ tất cả files evnict-kit (workflows, skills, rules).${c.reset}
   Files do user tự thêm sẽ KHÔNG bị xóa.
   Tiếp tục? (y/N): `, r
    ));
    rl.close();

    if (answer.trim().toLowerCase() !== 'y' && answer.trim().toLowerCase() !== 'yes') {
      console.log('\n   ⏭️  Đã hủy sync.');
      return;
    }
  }

  console.log('');

  // ── Sync each project ──
  const summary = { totalUpdated: 0, totalNew: 0, userFiles: [] };

  for (const repo of repos) {
    const projectPath = join(cwd, repo.folder);
    if (!existsSync(projectPath)) {
      console.log(`   ⚠️  ${repo.folder}/ không tồn tại — skip`);
      continue;
    }

    console.log(`${c.bold}── ${repo.type.toUpperCase()}: ${repo.folder} ──${c.reset}`);

    // Rules
    if (toolMap.rulesDir) {
      console.log(`   📏 Rules → ${toolMap.rulesDir}/`);
      const r = syncRules(projectPath, cwd, tool, toolMap);
      summary.totalUpdated += r.updated;
      if (r.userFiles.length > 0) {
        summary.userFiles.push(...r.userFiles.map(f => `${repo.folder}/${toolMap.rulesDir}/${f}`));
        console.log(`      ${c.green}✅ ${r.userFiles.length} user files preserved${c.reset}`);
      }
    }

    // Workflows
    if (toolMap.workflowsDir) {
      console.log(`   📋 Workflows → ${toolMap.workflowsDir}/`);
      const w = syncWorkflows(projectPath, cwd, tool, toolMap);
      summary.totalUpdated += w.updated;
      if (w.userFiles.length > 0) {
        summary.userFiles.push(...w.userFiles.map(f => `${repo.folder}/${toolMap.workflowsDir}/${f}`));
        console.log(`      ${c.green}✅ ${w.userFiles.length} user files preserved${c.reset}`);
      }
    }

    // Skills
    if (toolMap.skillsDir) {
      console.log(`   🎯 Skills → ${toolMap.skillsDir}/`);
      const s = syncSkills(projectPath, cwd, toolMap);
      summary.totalUpdated += s.updated;
      summary.totalNew += s.newSkills;
      if (s.userSkills.length > 0) {
        summary.userFiles.push(...s.userSkills.map(d => `${repo.folder}/${toolMap.skillsDir}/${d}/`));
        console.log(`      ${c.green}✅ ${s.userSkills.length} user skills preserved${c.reset}`);
      }
    }

    // Shared files (GETTING-STARTED.md)
    console.log(`   📖 Shared files`);
    const sh = syncSharedFiles(projectPath, cwd, toolMap);
    summary.totalUpdated += sh.updated;

    console.log('');
  }

  // ── Summary ──
  console.log(`${c.bold}${c.cyan}╔═══════════════════════════════════════════════════════╗
║  ✅  Sync complete!                                   ║
╠═══════════════════════════════════════════════════════╣${c.reset}
║
║  📊 ${c.bold}${summary.totalUpdated} files updated${c.reset}, ${c.bold}${summary.totalNew} new files${c.reset}
║  ${c.green}🔒 ${summary.userFiles.length} user files preserved (không bị xóa)${c.reset}`);

  if (summary.userFiles.length > 0) {
    console.log(`║`);
    console.log(`║  ${c.dim}User files kept:${c.reset}`);
    for (const f of summary.userFiles) {
      console.log(`║     ${c.dim}· ${f}${c.reset}`);
    }
  }

  console.log(`║
║  ${c.dim}Lưu ý: Context file (AGENTS.md/CLAUDE.md/.cursorrules)${c.reset}
║  ${c.dim}và rules RP05 (project conventions) KHÔNG bị ghi đè —${c.reset}
║  ${c.dim}vì chứa nội dung riêng của từng dự án.${c.reset}
║
${c.bold}${c.cyan}╚═══════════════════════════════════════════════════════╝${c.reset}
`);
}
