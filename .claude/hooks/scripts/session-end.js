#!/usr/bin/env node
/**
 * SessionEnd Hook - Persist session state
 *
 * Runs when a Claude session ends. Saves state for continuity
 * across sessions.
 */

const path = require('path');
const {
  getSessionsDir,
  getDateString,
  getDateTimeString,
  shortId,
  ensureDir,
  writeFile,
  appendFile,
  log
} = require('./utils');

async function main() {
  const sessionsDir = getSessionsDir();
  ensureDir(sessionsDir);

  // Create session file with date and short ID
  const dateStr = getDateString();
  const id = shortId();
  const sessionFile = path.join(sessionsDir, `${dateStr}-${id}-session.tmp`);

  // Log session end
  const timestamp = getDateTimeString();
  const logEntry = `Session ended at ${timestamp}\nWorking directory: ${process.cwd()}\n`;

  writeFile(sessionFile, logEntry);

  // Also append to session log
  const sessionLog = path.join(sessionsDir, 'session-log.txt');
  appendFile(sessionLog, `[${timestamp}] Session ended - ${process.cwd()}\n`);

  log('[SessionEnd] Session state persisted');
  process.exit(0);
}

main().catch(err => {
  console.error('[SessionEnd] Error:', err.message);
  process.exit(0); // Don't block on errors
});
