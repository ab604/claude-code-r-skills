#!/usr/bin/env node
/**
 * Git Push Blocker Hook
 *
 * Blocks git push to prevent accidental pushes.
 * Runs as PreToolUse hook on Bash tool calls.
 * Exits 2 to block and surface the message in the UI.
 */

const fs = require('fs');

try {
  const data = fs.readFileSync(0, 'utf8');
  const input = JSON.parse(data);
  const cmd = input.tool_input?.command || '';
  if (/git\s+push/.test(cmd)) {
    console.error('[Hook] BLOCKED: git push requires explicit user confirmation.');
    console.error('[Hook] Command: ' + cmd.trim());
    console.error('[Hook] Ask the user to confirm before pushing.');
    process.exit(2);
  }
} catch (e) {
  // Ignore errors - allow tool call to proceed
}

process.exit(0);
