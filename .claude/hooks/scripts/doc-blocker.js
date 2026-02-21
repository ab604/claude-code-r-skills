#!/usr/bin/env node
/**
 * Documentation File Blocker Hook
 *
 * Blocks creation of random .md or .txt files,
 * encouraging consolidation into README.md or CLAUDE.md.
 * Runs as PreToolUse hook on Write tool calls.
 * Exits 2 to block the write and surface the message in the UI.
 */

const fs = require('fs');

const ALLOWED = /(README|CLAUDE|AGENTS|CONTRIBUTING|SKILL)\.md$/;
const DOC_PATTERN = /\.(md|txt)$/;

try {
  const data = fs.readFileSync(0, 'utf8');
  const input = JSON.parse(data);
  const filePath = input.tool_input?.file_path || '';
  if (DOC_PATTERN.test(filePath) && !ALLOWED.test(filePath)) {
    console.error('[Hook] BLOCKED: Do not create documentation file: ' + filePath);
    console.error('[Hook] Consolidate docs into README.md or CLAUDE.md instead.');
    console.error('[Hook] Allowed names: README.md, CLAUDE.md, AGENTS.md, CONTRIBUTING.md, SKILL.md');
    process.exit(2);
  }
} catch (e) {
  // Ignore errors - allow tool call to proceed
}

process.exit(0);
