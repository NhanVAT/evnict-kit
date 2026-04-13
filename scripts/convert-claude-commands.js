// Convert Antigravity workflows to Claude Code commands format
// Run: node scripts/convert-claude-commands.js

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

const srcDir = join(ROOT, 'templates/workflows/antigravity');
const destDir = join(ROOT, 'templates/workflows/claude');

if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true });

const files = readdirSync(srcDir).filter(f => f.endsWith('.md'));

for (const file of files) {
  let content = readFileSync(join(srcDir, file), 'utf8');

  // Remove frontmatter (--- ... ---)
  content = content.replace(/^---\n[\s\S]*?\n---\n\n?/, '');

  // Extract command name from filename: evnict-kit-feature-large.md → feature-large
  const slug = file.replace('evnict-kit-', '').replace('.md', '');

  // Find the first # heading
  const firstHeadingMatch = content.match(/^# (.+)$/m);
  const title = firstHeadingMatch ? firstHeadingMatch[1] : slug;

  // Add $ARGUMENTS handling after the command line
  const commandLineRegex = /\*\*Command:\*\* `\/evnict-kit:[^`]+`/;
  if (commandLineRegex.test(content)) {
    content = content.replace(
      commandLineRegex,
      `**Command:** \`/evnict-kit:${slug} $ARGUMENTS\`\n\n$ARGUMENTS chứa mô tả từ user.`
    );
  } else {
    // If no command line found, add after first heading
    content = content.replace(
      /^(# .+)$/m,
      `$1\n**Command:** \`/evnict-kit:${slug} $ARGUMENTS\`\n\n$ARGUMENTS chứa mô tả từ user.`
    );
  }

  writeFileSync(join(destDir, file), content, 'utf8');
  console.log(`✅ ${file} → claude commands`);
}

console.log(`\nDone: ${files.length} commands converted to ${destDir}`);
