# Init Wiki — Setup LLM Wiki
**Command:** `/evnict-kit:init-wiki $ARGUMENTS`

$ARGUMENTS chứa mô tả từ user.

## Mục đích
Setup llm-wiki knowledge base cho dự án. Copy từ template có sẵn hoặc clone từ GitHub.

## Options
- `/evnict-kit:init-wiki` → Copy từ templates/wiki/ (mặc định)
- `/evnict-kit:init-wiki --from-github` → Clone fresh từ GitHub

---

## Workflow (Default — Copy Template)

### Bước 1: Xác định wiki path
```bash
cat .evnict/config.yaml | grep wiki
# → wiki.folder: "{project}-wiki"
```

### Bước 2: Copy template
Wiki template đã có sẵn trong evnict-kit package:
```bash
cp -r {evnict-kit}/templates/wiki/ ./{project}-wiki/
```

### Bước 3: Install dependencies
```bash
cd {project}-wiki
npm install
```

### Bước 4: Configure
Tạo `config.yaml` từ `config.example.yaml`:
```yaml
project: "{project-name}"
raw_path: "raw/notes"
processed_path: "processed"
index_path: "processed/index.json"
```

### Bước 5: Tạo folder structure
```bash
mkdir -p raw/notes
mkdir -p processed
```

### Bước 6: First ingest (nếu có notes sẵn)
```bash
npm run ingest
```

### Bước 7: Verify
```
✅ Wiki setup: {project}-wiki/
✅ Dependencies installed
✅ Config created
✅ Folders ready
```

---

## Workflow (--from-github)

### Bước 1: Clone
```bash
git clone https://github.com/mduongvandinh/llm-wiki.git {project}-wiki
```

### Bước 2: Install + Configure
Same as steps 3-7 above.

---

## Output
Wiki folder ready at `{project}-wiki/` with npm dependencies installed.
