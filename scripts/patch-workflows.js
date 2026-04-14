/**
 * Patch script: Add Context Refresh + FE Design hint to all workflows
 * Run: node scripts/patch-workflows.js
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const TEMPLATES_DIR = join(import.meta.dirname, '..', 'templates');

// ═══════════════════════════════════════════
// Context Refresh block (smart check mechanism)
// ═══════════════════════════════════════════
const CONTEXT_REFRESH = `
---

## ⚠️ NHẮC NHỞ: Tuân thủ Rules & Context

> **Agent dùng lâu có thể quên rules.** Trước khi bắt đầu code, tự kiểm tra:

### Quick Check (agent tự đánh giá)
1. ✅ Tôi đã đọc \`.agent/rules/\` trong phiên làm việc này chưa?
2. ✅ Tôi đã đọc AGENTS.md (hoặc context file) chưa?
3. ✅ Tôi nhớ rõ coding conventions của dự án này không?

**→ Nếu BẤT KỲ câu nào = "CHƯA" hoặc "KHÔNG CHẮC":**
- Đọc lại tất cả files trong \`.agent/rules/\` (hoặc thư mục rules tương ứng)
- Đọc lại AGENTS.md (hoặc context file tương ứng)
- Query wiki nếu có: \`grep -rl "{keyword}" {wiki_path}/processed/ --include="*.md"\`

**→ Nếu TẤT CẢ = "RỒI" → tiếp tục workflow, KHÔNG cần đọc lại.**

> **NGUYÊN TẮC:** Không chắc convention → ĐỌC LẠI rule file. KHÔNG đoán.
`;

// ═══════════════════════════════════════════
// FE Design hint block
// ═══════════════════════════════════════════
const FE_DESIGN_HINT = `
> 🎨 **FE UI Quality:** Khi tạo/sửa UI component, tham khảo skill \`evnict-kit-frontend-design\`
> để đảm bảo chất lượng thiết kế cao. Áp dụng Design Thinking (Purpose → Tone → Constraints → Differentiation) trước khi code UI.
`;

// ═══════════════════════════════════════════
// Files that need FE Design hint (in addition to Context Refresh)
// ═══════════════════════════════════════════
const FE_HINT_FILES = [
  'evnict-kit-feature-small.md',
  'evnict-kit-feature-large.md',
  'evnict-kit-implement.md',
  'evnict-kit-plan.md',
  'evnict-kit-handoff.md',
  'evnict-kit-bug-fix.md',
];

// ═══════════════════════════════════════════
// Process workflow files in a tool directory
// ═══════════════════════════════════════════
function patchFile(filePath, addFeHint) {
  let content = readFileSync(filePath, 'utf8');
  
  // Skip if already patched
  if (content.includes('NHẮC NHỞ: Tuân thủ Rules & Context')) {
    console.log(`   ⏭️  Already patched: ${filePath}`);
    return false;
  }

  // Find the insertion point — before "## Checklist" or "## Tiêu chí" at the end
  const checklistPatterns = [
    /\n## Checklist[^\n]*\n/,
    /\n## Checklist hoàn thành[^\n]*\n/,
    /\n## Tiêu chí hoàn thành[^\n]*\n/,
    /\n## Tiêu chí thành công[^\n]*\n/,
    /\n## Output[^\n]*\n/,
  ];

  let insertPos = -1;
  for (const pattern of checklistPatterns) {
    const match = content.match(pattern);
    if (match) {
      insertPos = content.lastIndexOf(match[0]);
      break;
    }
  }

  let insertBlock = '';
  
  // Add FE Design hint if applicable
  if (addFeHint) {
    insertBlock += FE_DESIGN_HINT;
  }
  
  // Add Context Refresh
  insertBlock += CONTEXT_REFRESH;

  if (insertPos >= 0) {
    // Insert before checklist
    content = content.slice(0, insertPos) + insertBlock + content.slice(insertPos);
  } else {
    // No checklist found — append at end
    content = content.trimEnd() + '\n' + insertBlock + '\n';
  }

  writeFileSync(filePath, content, 'utf8');
  console.log(`   ✅ Patched: ${filePath}${addFeHint ? ' (+FE Design)' : ''}`);
  return true;
}

// ═══════════════════════════════════════════
// Main
// ═══════════════════════════════════════════
const toolDirs = ['antigravity', 'claude'];
let patchedCount = 0;

for (const tool of toolDirs) {
  const wfDir = join(TEMPLATES_DIR, 'workflows', tool);
  if (!existsSync(wfDir)) {
    console.log(`⚠️  Skipping ${tool} — directory not found`);
    continue;
  }

  console.log(`\n══ Patching ${tool} workflows ══`);
  const files = readdirSync(wfDir).filter(f => f.endsWith('.md') && f !== 'README.md');
  
  for (const file of files) {
    const addFeHint = FE_HINT_FILES.includes(file);
    const patched = patchFile(join(wfDir, file), addFeHint);
    if (patched) patchedCount++;
  }
}

// Also patch skills
const skillDirs = ['evnict-kit-create-component', 'evnict-kit-create-page'];
console.log(`\n══ Patching skills ══`);
for (const skillDir of skillDirs) {
  const skillPath = join(TEMPLATES_DIR, 'skills', skillDir, 'SKILL.md');
  if (existsSync(skillPath)) {
    const patched = patchFile(skillPath, true);
    if (patched) patchedCount++;
  }
}

console.log(`\n✅ Done! Patched ${patchedCount} files.`);
