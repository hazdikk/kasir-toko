#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const claudePath = path.join(root, 'CLAUDE.md');
const agentsPath = path.join(root, 'AGENTS.md');

if (!fs.existsSync(claudePath)) {
  console.error('CLAUDE.md not found');
  process.exit(1);
}

const claude = fs.readFileSync(claudePath, 'utf8').trimEnd();

const nextJsBlock = [
  '<!-- BEGIN:nextjs-agent-rules -->',
  '# This is NOT the Next.js you know',
  '',
  'This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.',
  '<!-- END:nextjs-agent-rules -->',
].join('\n');

const generated = [
  '<!-- AUTO-GENERATED: run `npm run sync:agent-docs` -->',
  nextJsBlock,
  '',
  claude,
  '',
].join('\n');

fs.writeFileSync(agentsPath, generated, 'utf8');
console.log('Synced AGENTS.md from CLAUDE.md');
