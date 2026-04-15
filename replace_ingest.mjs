import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function getAllFiles(dirPath, arrayOfFiles) {
  const files = readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.md')) {
        arrayOfFiles.push(join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

const templatesDir = 'n:/AI/evnit-workspace/evnict-kit-v0.2.4/templates';
const files = getAllFiles(templatesDir);
let totalModifications = 0;

for (const file of files) {
    let content = readFileSync(file, 'utf-8');
    let modified = false;

    const regex1 = /```bash\s+cd \{wiki_path\} && Agent follow SKILL\.md to ingest\s+```/g;
    const replacement1 = `**Agent TỰ ĐỘNG thực hiện INGEST:**
Đọc tài liệu \`SKILL.md\` của \`evnict-kit-wiki\` và làm theo các bước trong **Sub-command: INGEST** để nạp tri thức từ \`raw/notes/\` vào cấu trúc \`wiki/\` (history.json, INDEX, entities...).
*(Lưu ý: Agent tự đọc và xử lý bằng các công cụ nội bộ, tuyệt đối KHÔNG in ra màn hình lệnh \`cd ... && Agent follow ...\` cho user)*`;

    if (regex1.test(content)) {
        content = content.replace(regex1, replacement1);
        modified = true;
    }

    if (modified) {
        writeFileSync(file, content, 'utf-8');
        console.log(`Updated: ${file}`);
        totalModifications++;
    }
}

console.log(`Total files modified: ${totalModifications}`);
