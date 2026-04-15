import { existsSync, writeFileSync, readFileSync, readdirSync, mkdirSync, lstatSync, symlinkSync } from 'node:fs';
import { join, resolve } from 'node:path';
import readline from 'node:readline';
import { ensureDir, writeFile, copyTemplateDir, TEMPLATES_DIR } from '../utils/file.js';
import { TECH_LABELS, TECH_TYPE_HINTS, getToolMap, SUPPORTED_TOOLS } from '../utils/config.js';

// ════════════════════════════════════════════════════════════════════
// Entry point — route to interactive or non-interactive
// ════════════════════════════════════════════════════════════════════

export async function initCommand(options) {
  // Nếu có --name hoặc --no-interactive → backward compat, chạy như v0.1.3
  if (options.name || options.interactive === false) {
    if (!options.name) {
      console.error('❌ --no-interactive yêu cầu --name. VD: evnict-kit init --name=ncpt --no-interactive');
      process.exit(1);
    }
    return initNonInteractive(options);
  }
  // Không có --name → interactive wizard
  return initInteractive(options);
}

// ════════════════════════════════════════════════════════════════════
// NON-INTERACTIVE MODE (backward compat v0.1.3)
// ════════════════════════════════════════════════════════════════════

async function initNonInteractive(options) {
  const cwd = process.cwd();
  const name = options.name;
  const be = options.be || `${name}-be`;
  const fe = options.fe || `${name}-fe`;
  const tool = options.tool || 'antigravity';
  const techBe = options.techBe || 'springboot';
  const techFe = options.techFe || 'angular';
  const db = options.db || 'oracle';
  const wikiEnabled = options.wiki !== false;

  const repoConfigs = [
    { folder: be, type: 'backend', tech: techBe },
    { folder: fe, type: 'frontend', tech: techFe },
  ];

  await deployWorkspace({ name, tool, repoConfigs, db, wikiEnabled, cwd });
}

// ════════════════════════════════════════════════════════════════════
// INTERACTIVE MODE (v0.1.4 wizard)
// ════════════════════════════════════════════════════════════════════

async function initInteractive(options) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q) => new Promise(r => rl.question(q, r));

  console.log(`
╔═══════════════════════════════════════════╗
║     🚀 EVNICT-KIT v0.2.5: Init Setup    ║
╚═══════════════════════════════════════════╝
`);

  // Step 1: Tên dự án
  const name = (await ask('? Tên dự án: ')).trim();
  if (!name) {
    console.error('❌ Tên dự án không được để trống.');
    rl.close();
    process.exit(1);
  }

  // Step 2: Chọn AI Tool
  const toolChoices = ['antigravity', 'claude', 'cursor', 'codex', 'copilot'];
  console.log('\n? Chọn AI Tool:');
  toolChoices.forEach((t, i) => {
    const marker = i === 0 ? ' (default)' : '';
    const supported = SUPPORTED_TOOLS.includes(t) ? '' : ' [chưa có template]';
    console.log(`   ${i + 1}. ${t}${marker}${supported}`);
  });
  const toolInput = (await ask(`  Chọn (1-${toolChoices.length}) [1]: `)).trim();
  const toolIdx = toolInput ? parseInt(toolInput, 10) - 1 : 0;
  const tool = toolChoices[toolIdx] || 'antigravity';

  if (!SUPPORTED_TOOLS.includes(tool)) {
    console.log(`\n⚠️  ${tool} templates chưa sẵn sàng. Dùng 1 trong 5 tool: ${SUPPORTED_TOOLS.join(', ')}.`);
    rl.close();
    return;
  }

  // Step 3: Scan workspace
  const cwd = process.cwd();
  console.log('\nScanning workspace...');
  const folders = scanWorkspaceFolders(cwd);

  if (folders.length === 0) {
    console.log('   Không tìm thấy project folder nào trong workspace.');
    console.log('   Tạo folder cho BE/FE trước, rồi chạy lại evnict-kit init.\n');
    rl.close();
    return;
  }

  console.log(`Tìm thấy ${folders.length} folders:`);
  folders.forEach((f, i) => {
    const techLabel = f.detectedTech ? ` (detected: ${TECH_LABELS[f.detectedTech] || f.detectedTech})` : '';
    console.log(`   ${i + 1}. ${f.folder}/${techLabel}`);
  });

  // Step 4: Chọn repos (multi-select)
  const repoInput = (await ask(`\n? Chọn repos (nhập số, phân cách dấu phẩy, hoặc 'all') [all]: `)).trim();
  let selectedFolders;
  if (!repoInput || repoInput.toLowerCase() === 'all') {
    selectedFolders = [...folders];
  } else {
    const indices = repoInput.split(',').map(s => parseInt(s.trim(), 10) - 1);
    selectedFolders = indices
      .filter(i => i >= 0 && i < folders.length)
      .map(i => folders[i]);
  }

  if (selectedFolders.length === 0) {
    console.log('❌ Không có repo nào được chọn.');
    rl.close();
    return;
  }

  // Step 5: Gán type cho mỗi repo (auto-detect + confirm)
  console.log('\n📂 Phân loại project (backend/frontend):');
  console.log('   Nhấn Enter để chấp nhận gợi ý, hoặc gõ: backend | frontend | shared | library\n');
  const repoConfigs = [];
  for (const f of selectedFolders) {
    const suggestedType = f.detectedTech ? (TECH_TYPE_HINTS[f.detectedTech] || '') : '';
    const techInfo = f.detectedTech ? `${TECH_LABELS[f.detectedTech] || f.detectedTech}` : 'không nhận diện được';
    const defaultHint = suggestedType ? suggestedType : 'backend';
    const typeInput = (await ask(`  ${f.folder}/ → phát hiện: ${techInfo} → loại [${defaultHint}]: `)).trim();
    const type = typeInput || suggestedType || 'backend';
    const tech = f.detectedTech || (type === 'backend' ? 'springboot' : 'angular');
    repoConfigs.push({ folder: f.folder, type, tech });
  }

  // Step 6: Database
  const dbInput = (await ask('\n? Database (oracle/sqlserver) [oracle]: ')).trim();
  const db = dbInput || 'oracle';

  // Step 7: Wiki
  const wikiInput = (await ask('? Thêm LLM Wiki? (Y/n): ')).trim();
  const wikiEnabled = wikiInput.toLowerCase() !== 'n';

  rl.close();

  console.log('\nInitializing...\n');
  await deployWorkspace({ name, tool, repoConfigs, db, wikiEnabled, cwd });
}

// ════════════════════════════════════════════════════════════════════
// Scan workspace folders + detect tech
// ════════════════════════════════════════════════════════════════════

function scanWorkspaceFolders(cwd) {
  const entries = readdirSync(cwd, { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    // Skip hidden dirs and well-known non-project dirs
    if (entry.name.startsWith('.')) continue;
    if (['node_modules', 'docs', 'database', 'dist', 'build', 'target'].includes(entry.name)) continue;
    if (entry.name.endsWith('-wiki')) continue;

    const folderPath = join(cwd, entry.name);
    const detectedTech = detectTech(folderPath);
    results.push({ folder: entry.name, detectedTech });
  }

  return results;
}

function detectTech(folderPath) {
  // Java Spring Boot
  if (existsSync(join(folderPath, 'pom.xml'))) {
    try {
      const pom = readFileSync(join(folderPath, 'pom.xml'), 'utf8');
      if (pom.includes('spring-boot-starter')) return 'springboot';
    } catch { /* ignore */ }
    return 'springboot'; // Java project, assume Spring Boot
  }

  // Java/Kotlin Gradle
  if (existsSync(join(folderPath, 'build.gradle')) || existsSync(join(folderPath, 'build.gradle.kts'))) {
    return 'springboot';
  }

  // Angular
  if (existsSync(join(folderPath, 'angular.json'))) {
    return 'angular';
  }

  // ASP.NET Core
  try {
    const files = readdirSync(folderPath);
    if (files.some(f => f.endsWith('.csproj') || f.endsWith('.sln'))) {
      return 'aspnet';
    }
  } catch { /* ignore */ }

  // Node.js / React / React Native / Next.js
  const pkgPath = join(folderPath, 'package.json');
  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };
      if (allDeps['react-native']) return 'react-mobile';
      if (allDeps['next']) return 'nextjs';
      if (allDeps['react']) return 'react-web';
      return 'nodejs';
    } catch { /* ignore */ }
  }

  return null; // Unknown
}

// ════════════════════════════════════════════════════════════════════
// Deploy workspace — shared logic for interactive + non-interactive
// ════════════════════════════════════════════════════════════════════

async function deployWorkspace({ name, tool, repoConfigs, db, wikiEnabled, cwd }) {
  const toolMap = getToolMap(tool);

  console.log(`
╔═══════════════════════════════════════════════════════╗
║         🚀 EVNICT-KIT v0.2.5: Init Workspace         ║
╚═══════════════════════════════════════════════════════╝

   Project:  ${name}
   Repos:    ${repoConfigs.map(r => `${r.folder} (${r.type}/${TECH_LABELS[r.tech] || r.tech})`).join(', ')}
   Database: ${TECH_LABELS[db] || db}
   AI Tool:  ${tool} → ${toolMap.agentDir}/ + ${toolMap.contextFile}
   Wiki:     ${wikiEnabled ? 'enabled' : 'disabled'}
`);

  const totalSteps = 3 + repoConfigs.length + (wikiEnabled ? 1 : 0) + 1;
  let step = 0;

  // ══ 1. Workspace-level .evnict/ ══
  step++;
  console.log(`── [${step}/${totalSteps}] Workspace .evnict/ ──`);
  const evnictDir = join(cwd, '.evnict');
  for (const d of [evnictDir, join(evnictDir,'handoff'), join(evnictDir,'handoff/contracts'), join(evnictDir,'specs')]) {
    ensureDir(d, cwd);
  }
  writeFile(join(evnictDir, 'config.yaml'), genConfig(name, repoConfigs, db, tool, wikiEnabled), {cwd});
  writeFile(join(evnictDir, 'handoff/current-feature.md'), `# Current Feature\nstatus: idle\n`, {cwd,silent:true});
  writeFile(join(evnictDir, 'handoff/be-status.md'), `# BE Status\nstatus: idle\n`, {cwd,silent:true});
  writeFile(join(evnictDir, 'handoff/fe-status.md'), `# FE Status\nstatus: idle\n`, {cwd,silent:true});

  // v0.2.3: Tạo handoff.md template
  const handoffTemplate = `# Agent Handoff Log
> File này dùng để trao đổi giữa BE Agent và FE Agent.
> Mỗi issue ghi theo format bên dưới.

---

## Template
### [YYYY-MM-DD] {FE→BE | BE→FE}: Tiêu đề ngắn
- **Trạng thái:** 🔴 Chờ xử lý | 🟡 Đang xử lý | 🟢 Đã xử lý
- **Mô tả:** ...
- **API liên quan:** METHOD /endpoint
- **Request/Response mẫu:** ...
- **Mong muốn:** ...
- **File liên quan:** ...
- **Kết quả xử lý:** (bên nhận điền sau khi fix)

---

## Entries

`;
  writeFile(join(evnictDir, 'handoff/handoff.md'), handoffTemplate, {cwd,silent:true});

  // ══ 2. Docs + Database folders ══
  step++;
  console.log(`\n── [${step}/${totalSteps}] Docs & Database ──`);
  for (const d of ['docs','docs/specs','docs/attt','docs/postmortem','database','database/migrations']) {
    ensureDir(join(cwd,d), cwd);
  }

  // ══ Wiki ══
  if (wikiEnabled) {
    step++;
    console.log(`\n── [${step}/${totalSteps}] Wiki ──`);

    // v0.1.5: Detect wiki repo có sẵn trong workspace
    const existingWiki = readdirSync(cwd, { withFileTypes: true })
      .filter(e => e.isDirectory())
      .map(e => e.name)
      .filter(f => f.endsWith('-wiki') || f === 'llm-wiki')
      .filter(f => existsSync(join(cwd, f, 'config.yaml')) || existsSync(join(cwd, f, 'config.example.yaml')));

    if (existingWiki.length > 0 && !existingWiki.includes(`${name}-wiki`)) {
      console.log(`   📚 Phát hiện wiki repo có sẵn: ${existingWiki.join(', ')}`);
      console.log(`   💡 Sẽ dùng wiki đầu tiên tìm được: ${existingWiki[0]}`);
      console.log(`   💡 Nếu muốn dùng wiki khác, rename thành ${name}-wiki hoặc sửa .evnict/config.yaml`);
    }

    const wikiPath = join(cwd, `${name}-wiki`);
    if (!existsSync(wikiPath)) {
      console.log('   📚 Copying wiki template...');
      const wikiSrc = join(TEMPLATES_DIR, 'wiki');
      if (existsSync(wikiSrc)) {
        ensureDir(wikiPath, cwd);
        const count = copyTemplateDir(wikiSrc, wikiPath, cwd);
        
        // Tạo thêm folder structure cho Agent
        ensureDir(join(wikiPath, 'wiki/entities'), cwd);
        ensureDir(join(wikiPath, 'wiki/concepts'), cwd);
        ensureDir(join(wikiPath, 'wiki/sources'), cwd);
        ensureDir(join(wikiPath, 'wiki/syntheses'), cwd);
        ensureDir(join(wikiPath, 'outputs'), cwd);
        ensureDir(join(wikiPath, '.discoveries'), cwd);

        const configPath = join(wikiPath, 'config.example.yaml');
        if (existsSync(configPath)) {
          let content = readFileSync(configPath, 'utf8');
          content = content.replaceAll('My LLM Wiki', name);
          writeFileSync(join(wikiPath, 'config.yaml'), content, 'utf8');
          console.log(`   ✅ config.yaml created`);
        }
        console.log(`   ✅ Wiki template deployed (${count} files)`);
        console.log(`   💡 Mở Agent trong ${name}-wiki/, chạy: /llm-wiki init "${name}"`);
      } else {
        console.log(`   ⚠️  Wiki template not found — fallback to manual setup`);
        ensureDir(wikiPath, cwd);
        ensureDir(join(wikiPath, 'raw/notes'), cwd);
      }
    } else {
      console.log(`   ⏭️  Wiki repo đã tồn tại: ${name}-wiki/`);
    }
  }

  // ══ 3..N. Deploy vào từng project ══
  for (const repo of repoConfigs) {
    step++;
    console.log(`\n── [${step}/${totalSteps}] ${repo.type.toUpperCase()} project: ${repo.folder} ──`);
    const projectPath = join(cwd, repo.folder);
    if (existsSync(projectPath)) {
      deployToProject(projectPath, cwd, {
        tool, toolMap, name, type: repo.type, tech: repo.tech, db,
        allRepos: repoConfigs,
      });
      // Symlinks
      createSymlinks(projectPath, cwd, name);
      // Update .gitignore
      updateGitignore(projectPath, name);
    } else {
      console.log(`   ⚠️  Folder "${repo.folder}" chưa tồn tại — skip`);
    }
  }


  // ══ Workspace file ══
  step++;
  console.log(`\n── [${step}/${totalSteps}] Workspace file ──`);
  const wsContent = {
    folders: repoConfigs.map(r => ({
      name: `${r.type === 'backend' ? '🔧' : '🎨'} ${r.folder}`,
      path: r.folder,
    })),
    settings: { 'evnict-kit.project': name, 'evnict-kit.tool': tool }
  };
  wsContent.folders.push({ name: '📁 docs', path: 'docs' });
  wsContent.folders.push({ name: '🗄️ database', path: 'database' });
  if (wikiEnabled) wsContent.folders.push({ name: '📚 wiki', path: `${name}-wiki` });
  writeFile(join(cwd, `${name}.code-workspace`), JSON.stringify(wsContent, null, 2), {cwd});

  // ══ Summary ══
  const repoList = repoConfigs.map(r => `║    ${r.type === 'backend' ? '🔧' : '🎨'} ${r.folder} (${TECH_LABELS[r.tech] || r.tech})`).join('\n');

  console.log(`
╔═══════════════════════════════════════════════════════╗
║  ✅  Workspace "${name}" v0.2.5 initialized!          ║
╠═══════════════════════════════════════════════════════╣
║                                                       ║
║  Projects:                                            ║
${repoList}
║                                                       ║
║  Cấu trúc mỗi project:                               ║
║    ${toolMap.agentDir}/                                         ║
║    ├── rules/        ← rule files (flat)              ║
║    ├── skills/       ← skills                         ║
║    └── workflows/    ← workflows + commands (flat)    ║
║    🔗 Symlinks: ${name}-wiki, docs, database, .evnict ║
║                                                       ║
║  📋 Next steps:                                       ║
║    1. Mở AI Agent trong project                       ║
║    2. /evnict-kit:init-rules  → điền rules RP01-RP07 ║
║    3. /evnict-kit:init-context → sinh context file    ║
║    4. /evnict-kit:init-check  → verify setup          ║
║                                                       ║
║  💡 Thêm project sau: evnict-kit add <folder>         ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
`);
}

// ════════════════════════════════════════════════════════════════════
// Create symbolic links
// ════════════════════════════════════════════════════════════════════

function createSymlinks(projectPath, cwd, projectName) {
  const linkType = process.platform === 'win32' ? 'junction' : 'dir';

  const links = [
    { target: join(cwd, `${projectName}-wiki`), link: join(projectPath, `${projectName}-wiki`), label: `${projectName}-wiki` },
    { target: join(cwd, 'docs'), link: join(projectPath, 'docs'), label: 'docs' },
    { target: join(cwd, 'database'), link: join(projectPath, 'database'), label: 'database' },
    { target: join(cwd, '.evnict'), link: join(projectPath, '.evnict'), label: '.evnict' },
  ];

  for (const { target, link, label } of links) {
    if (!existsSync(target)) {
      // Target doesn't exist at workspace level → skip quietly
      continue;
    }

    if (existsSync(link)) {
      try {
        const stat = lstatSync(link);
        if (stat.isSymbolicLink()) {
          console.log(`   ⏭️  Symlink ${label} đã tồn tại → skip`);
        } else {
          // Real directory/file → warn, don't overwrite
          console.log(`   ⚠️  ${label} đã tồn tại (không phải symlink) → skip`);
          console.log(`      Nếu muốn dùng ${label} chung từ workspace:`);
          console.log(`      1. Di chuyển nội dung ${label}/ hiện tại vào workspace`);
          console.log(`      2. Xóa folder ${label}/ trong project`);
          console.log(`      3. Chạy lại evnict-kit init hoặc evnict-kit add`);
        }
      } catch {
        console.log(`   ⚠️  ${label} tồn tại nhưng không đọc được stat → skip`);
      }
    } else {
      try {
        // For junctions on Windows, target must be absolute
        const absTarget = resolve(target);
        symlinkSync(absTarget, link, linkType);
        console.log(`   🔗 Symlink: ${label} → workspace ${label}`);
      } catch (err) {
        console.log(`   ❌ Không tạo được symlink ${label}: ${err.message}`);
      }
    }
  }
}

// ════════════════════════════════════════════════════════════════════
// Update .gitignore with symlink entries
// ════════════════════════════════════════════════════════════════════

function updateGitignore(projectPath, projectName) {
  const gitignorePath = join(projectPath, '.gitignore');
  const symlinkEntries = [
    `# Symlinks từ evnict-kit`,
    `${projectName}-wiki`,
    `docs`,
    `database`,
    `.evnict`,
  ];

  let content = '';
  if (existsSync(gitignorePath)) {
    content = readFileSync(gitignorePath, 'utf8');
  }

  // Check if already has evnict-kit symlink section
  if (content.includes('# Symlinks từ evnict-kit')) {
    return; // Already configured
  }

  const separator = content.endsWith('\n') || content === '' ? '' : '\n';
  const addition = `${separator}\n${symlinkEntries.join('\n')}\n`;
  writeFileSync(gitignorePath, content + addition, 'utf8');
  console.log(`   ✅ .gitignore updated (symlink entries)`);
}

// ════════════════════════════════════════════════════════════════════
// Deploy to individual project — v0.2.3 Multi-Tool Adapter Pattern
// ════════════════════════════════════════════════════════════════════

function deployToProject(projectPath, cwd, opts) {
  const { tool, toolMap } = opts;

  switch (toolMap.deployMode) {
    case 'flat':
      // Antigravity + Codex: deploy rules/, skills/, workflows/ riêng
      if (tool === 'codex') {
        // Codex reuse antigravity templates
        deployFlat(projectPath, cwd, { ...opts, tool: 'antigravity' });
      } else {
        deployFlat(projectPath, cwd, opts);
      }
      break;

    case 'mega-file':
      // Claude Code: sinh 1 CLAUDE.md lớn + .claude/commands/
      deployClaude(projectPath, cwd, opts);
      break;

    case 'rules-only':
      // Cursor: deploy .cursor/rules/*.mdc + .cursorrules
      deployCursor(projectPath, cwd, opts);
      break;

    case 'single-file':
      // Copilot: sinh 1 file .github/copilot-instructions.md
      deployCopilot(projectPath, cwd, opts);
      break;

    default:
      console.log(`   ⚠️  Unknown deployMode: ${toolMap.deployMode} — fallback to flat`);
      deployFlat(projectPath, cwd, opts);
  }

  // ═══ Shared: Context file + Instruct + Getting Started ═══
  deployShared(projectPath, cwd, opts);
}

// ════════════════════════════════════════════════════════════════════
// deployFlat — Antigravity / Codex (original logic, unchanged output)
// ════════════════════════════════════════════════════════════════════

function deployFlat(projectPath, cwd, opts) {
  const { tool, toolMap } = opts;

  // ═══ Rules — FLAT deployment ═══
  console.log(`   📏 Rules → ${toolMap.rulesDir}/`);
  const rulesSrc = join(TEMPLATES_DIR, 'rules', tool);
  const rulesDest = join(projectPath, toolMap.rulesDir);
  if (existsSync(rulesSrc)) {
    ensureDir(rulesDest, cwd);
    const ruleFiles = readdirSync(rulesSrc).filter(f => f.endsWith('.md'));
    for (const file of ruleFiles) {
      const content = readFileSync(join(rulesSrc, file), 'utf8');
      writeFile(join(rulesDest, file), content, {cwd});
    }
    console.log(`      ${ruleFiles.length} rule files deployed`);
  }

  // ═══ Skills — subfolder/SKILL.md (unchanged structure) ═══
  console.log(`   🎯 Skills → ${toolMap.skillsDir}/`);
  const skillsSrc = join(TEMPLATES_DIR, 'skills');
  if (existsSync(skillsSrc)) {
    const skillDirs = readdirSync(skillsSrc, {withFileTypes:true})
      .filter(d => d.isDirectory());
    for (const d of skillDirs) {
      const dest = join(projectPath, toolMap.skillsDir, d.name);
      ensureDir(dest, cwd);
      copyTemplateDir(join(skillsSrc, d.name), dest, cwd);
    }
    console.log(`      ${skillDirs.length} skills deployed`);
  }

  // ═══ Workflows — FLAT deployment (includes commands merged) ═══
  console.log(`   📋 Workflows → ${toolMap.workflowsDir}/`);
  const workflowsSrc = join(TEMPLATES_DIR, 'workflows', tool);
  const workflowsDest = join(projectPath, toolMap.workflowsDir);
  if (existsSync(workflowsSrc)) {
    ensureDir(workflowsDest, cwd);
    const wfFiles = readdirSync(workflowsSrc).filter(f => f.endsWith('.md'));
    for (const file of wfFiles) {
      const content = readFileSync(join(workflowsSrc, file), 'utf8');
      writeFile(join(workflowsDest, file), content, {cwd});
    }
    console.log(`      ${wfFiles.length} workflow files deployed`);
  }

  // ═══ Context directory ═══
  if (toolMap.contextDir) {
    ensureDir(join(projectPath, toolMap.contextDir), cwd);
  }
}

// ════════════════════════════════════════════════════════════════════
// deployClaude — Claude Code: CLAUDE.md + .claude/commands/
// ════════════════════════════════════════════════════════════════════

function deployClaude(projectPath, cwd, opts) {
  const { toolMap } = opts;

  // ═══ Commands — workflows adapted for Claude ═══
  console.log(`   📋 Commands → ${toolMap.workflowsDir}/`);
  const cmdSrc = join(TEMPLATES_DIR, 'workflows', 'claude');
  const cmdDest = join(projectPath, toolMap.workflowsDir);
  if (existsSync(cmdSrc)) {
    ensureDir(cmdDest, cwd);
    const cmdFiles = readdirSync(cmdSrc).filter(f => f.endsWith('.md'));
    for (const file of cmdFiles) {
      const content = readFileSync(join(cmdSrc, file), 'utf8');
      writeFile(join(cmdDest, file), content, {cwd});
    }
    console.log(`      ${cmdFiles.length} commands deployed`);
  } else {
    console.log(`      ⚠️ Claude commands not found — run conversion script first`);
  }

  // No separate rules, skills, contextDir for Claude (all in CLAUDE.md)
  console.log(`   📏 Rules → gộp trong CLAUDE.md`);
  console.log(`   🎯 Skills → gộp trong .claude/commands/`);
}

// ════════════════════════════════════════════════════════════════════
// deployCursor — Cursor: .cursorrules + .cursor/rules/*.mdc
// ════════════════════════════════════════════════════════════════════

function deployCursor(projectPath, cwd, opts) {
  const { toolMap } = opts;

  // ═══ Rules — .mdc files ═══
  console.log(`   📏 Rules → ${toolMap.rulesDir}/ (.mdc)`);
  const rulesSrc = join(TEMPLATES_DIR, 'rules', 'cursor');
  const rulesDest = join(projectPath, toolMap.rulesDir);
  if (existsSync(rulesSrc)) {
    ensureDir(rulesDest, cwd);
    const ruleFiles = readdirSync(rulesSrc).filter(f => f.endsWith('.mdc'));
    for (const file of ruleFiles) {
      const content = readFileSync(join(rulesSrc, file), 'utf8');
      writeFile(join(rulesDest, file), content, {cwd});
    }
    console.log(`      ${ruleFiles.length} rule files deployed (.mdc)`);
  }

  // No skills, workflows, contextDir for Cursor
  console.log(`   🎯 Skills → ❌ Cursor không hỗ trợ native skills`);
  console.log(`   📋 Workflows → ❌ Cursor không hỗ trợ native workflows`);
}

// ════════════════════════════════════════════════════════════════════
// deployCopilot — GitHub Copilot: single file
// ════════════════════════════════════════════════════════════════════

function deployCopilot(projectPath, cwd, opts) {
  // Copilot chỉ cần context file (copilot-instructions.md)
  // Context file sẽ được deploy trong deployShared()
  console.log(`   📏 Rules → gộp trong copilot-instructions.md`);
  console.log(`   🎯 Skills → ❌ Copilot không hỗ trợ`);
  console.log(`   📋 Workflows → ❌ Copilot không hỗ trợ`);
}

// ════════════════════════════════════════════════════════════════════
// deployShared — Context file, Instruct, Getting Started (all tools)
// ════════════════════════════════════════════════════════════════════

function deployShared(projectPath, cwd, opts) {
  const { tool, toolMap, name, type, tech, db, allRepos } = opts;

  // ═══ Context file (AGENTS.md / CLAUDE.md / .cursorrules / copilot-instructions.md) ═══
  const ctxTemplateMap = {
    antigravity: 'AGENTS.md.template',
    claude: 'CLAUDE.md.template',
    cursor: 'cursorrules.template',
    copilot: 'copilot-instructions.md.template',
    codex: 'AGENTS.md.template',
  };
  const ctxSrc = join(TEMPLATES_DIR, 'context', ctxTemplateMap[tool] || 'AGENTS.md.template');
  if (existsSync(ctxSrc)) {
    let content = readFileSync(ctxSrc, 'utf8');
    content = content.replaceAll('{{PROJECT_NAME}}', name);
    content = content.replaceAll('{{TECH_STACK}}', TECH_LABELS[tech] || tech);
    content = content.replaceAll('{{DATABASE}}', TECH_LABELS[db] || db);
    content = content.replaceAll('{{DATE}}', new Date().toISOString().split('T')[0]);

    // Multi-repo aware: find be/fe folders from allRepos
    const beRepo = allRepos?.find(r => r.type === 'backend');
    const feRepo = allRepos?.find(r => r.type === 'frontend');
    content = content.replaceAll('{{BE_FOLDER}}', type === 'backend' ? '.' : (beRepo ? '../' + beRepo.folder : '.'));
    content = content.replaceAll('{{FE_FOLDER}}', type === 'frontend' ? '.' : (feRepo ? '../' + feRepo.folder : '.'));

    const ctxDest = join(projectPath, toolMap.contextFile);
    if (toolMap.contextFile.includes('/')) {
      mkdirSync(join(projectPath, toolMap.contextFile.split('/').slice(0,-1).join('/')), {recursive:true});
    }
    writeFile(ctxDest, content, {cwd});
  }

  // ═══ Instruct-Agent-AI.md ═══
  const instructTemplate = type === 'backend' ? 'Instruct-Agent-AI.be.md' : 'Instruct-Agent-AI.fe.md';
  const instructSrc = join(TEMPLATES_DIR, 'instruct', instructTemplate);
  if (existsSync(instructSrc)) {
    let content = readFileSync(instructSrc, 'utf8');
    content = content.replaceAll('{{PROJECT_NAME}}', name);
    content = content.replaceAll('{{TECH_STACK}}', TECH_LABELS[tech] || tech);
    content = content.replaceAll('{{DATABASE}}', TECH_LABELS[db] || db);
    content = content.replaceAll('{{AGENT_DIR}}', toolMap.agentDir);
    writeFile(join(projectPath, 'Instruct-Agent-AI.md'), content, {cwd});
  }

  // ═══ GETTING-STARTED.md (v0.2.3) ═══
  const guideTemplate = join(TEMPLATES_DIR, 'GETTING-STARTED.md');
  if (existsSync(guideTemplate)) {
    let content = readFileSync(guideTemplate, 'utf8');
    content = content.replaceAll('{{PROJECT_NAME}}', name);
    content = content.replaceAll('{{DATE}}', new Date().toISOString().split('T')[0]);
    writeFile(join(projectPath, 'GETTING-STARTED.md'), content, {cwd});
    console.log(`   📖 GETTING-STARTED.md deployed`);
  }
}


// ════════════════════════════════════════════════════════════════════
// Generate v0.1.4 config.yaml (multi-repo array format)
// ════════════════════════════════════════════════════════════════════

function genConfig(name, repoConfigs, db, tool, wiki) {
  const reposYaml = repoConfigs.map(r =>
    `  - { folder: "${r.folder}", type: "${r.type}", tech: "${r.tech}" }`
  ).join('\n');

  return `# EVNICT-KIT v0.2.5 Config
project:
  name: "${name}"
repos:
${reposYaml}
database:
  type: "${db}"
  folder: "database"
wiki:
  enabled: ${wiki}
  folder: "${name}-wiki"
  raw_notes_path: "raw/notes"
  auto_ingest: true
ai_tool: "${tool}"
coordination:
  handoff_dir: ".evnict/handoff"
`;
}

// Export for use by add.js
export { deployToProject, createSymlinks, updateGitignore, scanWorkspaceFolders, detectTech };
