import { mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export const PACKAGE_ROOT = join(__dirname, '../..');
export const TEMPLATES_DIR = join(PACKAGE_ROOT, 'templates');

export function ensureDir(dir, cwd = '') {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    const display = cwd ? dir.replace(cwd, '.') : dir;
    console.log(`   📁 ${display}`);
    return true;
  }
  return false;
}

export function writeFile(filePath, content, { overwrite = false, cwd = '', silent = false } = {}) {
  if (existsSync(filePath) && !overwrite) {
    if (!silent) {
      const display = cwd ? filePath.replace(cwd, '.') : filePath;
      console.log(`   ⏭️  Skip: ${display} (exists)`);
    }
    return false;
  }
  const dir = dirname(filePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(filePath, content, 'utf8');
  if (!silent) {
    const display = cwd ? filePath.replace(cwd, '.') : filePath;
    console.log(`   ✅ ${display}`);
  }
  return true;
}

export function copyTemplateDir(srcDir, destDir, cwd = '') {
  if (!existsSync(srcDir)) return 0;
  let count = 0;
  const entries = readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = join(srcDir, entry.name);
    const destPath = join(destDir, entry.name);
    if (entry.isDirectory()) {
      ensureDir(destPath, cwd);
      count += copyTemplateDir(srcPath, destPath, cwd);
    } else {
      if (writeFile(destPath, readFileSync(srcPath, 'utf8'), { cwd })) count++;
    }
  }
  return count;
}
