#!/usr/bin/env node
/**
 * Documentation File Warning Hook
 *
 * Warns when creating random .md or .txt files,
 * encouraging consolidation into README.md or CLAUDE.md.
 * Runs as PreToolUse hook on Write tool calls.
 */

const fs = require('fs');
const { isHookDisabled } = require('./utils');

if (isHookDisabled('doc-blocker')) process.exit(0);

const ALLOWED = /(README|CLAUDE|AGENTS|CONTRIBUTING|SKILL|MEMORY)\.md$/;
const ALLOWED_DIRS = /(^|\/)(commands|agents|contexts|skills)\//;
const DOC_PATTERN = /\.(md|txt)$/;

try {
  const data = fs.readFileSync(0, 'utf8');
  const input = JSON.parse(data);
  const filePath = input.tool_input?.file_path || '';
  if (DOC_PATTERN.test(filePath) && !ALLOWED.test(filePath) && !ALLOWED_DIRS.test(filePath)) {
    console.error('[Hook] WARNING: Creating documentation file: ' + filePath);
    console.error('[Hook] Consider consolidating docs into README.md or CLAUDE.md instead.');
    console.error('[Hook] Allowed names: README.md, CLAUDE.md, AGENTS.md, CONTRIBUTING.md, SKILL.md, MEMORY.md');
    process.exit(1);
  }
} catch (e) {
  // Ignore errors - allow tool call to proceed
}

process.exit(0);
