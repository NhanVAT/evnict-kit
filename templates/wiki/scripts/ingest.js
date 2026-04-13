#!/usr/bin/env node
/**
 * LLM Wiki — Ingest Script
 * Reads raw/notes/*.md → processes → outputs to processed/
 * 
 * Source: https://github.com/mduongvandinh/llm-wiki
 * License: MIT
 */

import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join, basename } from 'node:path';

const RAW_PATH = 'raw/notes';
const PROCESSED_PATH = 'processed';
const INDEX_PATH = join(PROCESSED_PATH, 'index.json');

// Ensure directories
if (!existsSync(PROCESSED_PATH)) mkdirSync(PROCESSED_PATH, { recursive: true });

// Read all markdown files
const files = existsSync(RAW_PATH) 
  ? readdirSync(RAW_PATH).filter(f => f.endsWith('.md'))
  : [];

console.log(`📚 Ingesting ${files.length} notes...`);

const index = [];

for (const file of files) {
  const content = readFileSync(join(RAW_PATH, file), 'utf8');
  
  // Extract frontmatter
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  const frontmatter = {};
  if (fmMatch) {
    fmMatch[1].split('\n').forEach(line => {
      const [key, ...val] = line.split(':');
      if (key && val.length) frontmatter[key.trim()] = val.join(':').trim().replace(/^["']|["']$/g, '');
    });
  }

  // Extract body (after frontmatter)
  const body = fmMatch ? content.slice(fmMatch[0].length).trim() : content;

  // Create processed entry
  const entry = {
    file: file,
    title: frontmatter.title || basename(file, '.md'),
    domain: frontmatter.domain || 'general',
    type: frontmatter.type || 'note',
    date: frontmatter.date || new Date().toISOString().split('T')[0],
    tags: frontmatter.tags ? frontmatter.tags.replace(/[\[\]]/g, '').split(',').map(t => t.trim()) : [],
    summary: body.split('\n').filter(l => l.trim()).slice(0, 3).join(' ').slice(0, 200),
  };

  index.push(entry);

  // Copy processed file
  writeFileSync(join(PROCESSED_PATH, file), content, 'utf8');
  console.log(`  ✅ ${file} → ${entry.title} (${entry.domain})`);
}

// Write index
writeFileSync(INDEX_PATH, JSON.stringify(index, null, 2), 'utf8');
console.log(`\n📋 Index: ${index.length} entries → ${INDEX_PATH}`);
console.log('✅ Ingest complete!');
