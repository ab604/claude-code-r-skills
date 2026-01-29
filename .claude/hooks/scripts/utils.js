/**
 * Cross-platform utilities for Claude Code hooks
 * Compatible with Windows, macOS, and Linux
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Get the Claude data directory (cross-platform)
 */
function getClaudeDir() {
  const home = os.homedir();
  return path.join(home, '.claude');
}

/**
 * Get the sessions directory for storing session state
 */
function getSessionsDir() {
  return path.join(getClaudeDir(), 'sessions');
}

/**
 * Get the learned skills directory
 */
function getLearnedSkillsDir() {
  return path.join(getClaudeDir(), 'learned');
}

/**
 * Get temp directory (cross-platform)
 */
function getTempDir() {
  return os.tmpdir();
}

/**
 * Ensure a directory exists
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Read file contents, returns null if file doesn't exist
 */
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    return null;
  }
}

/**
 * Write content to file
 */
function writeFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf8');
}

/**
 * Append content to file
 */
function appendFile(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.appendFileSync(filePath, content, 'utf8');
}

/**
 * Get current date-time string (YYYY-MM-DD HH:MM:SS)
 */
function getDateTimeString() {
  const now = new Date();
  return now.toISOString().replace('T', ' ').substring(0, 19);
}

/**
 * Get current date string (YYYY-MM-DD)
 */
function getDateString() {
  return new Date().toISOString().substring(0, 10);
}

/**
 * Get current time string (HH:MM:SS)
 */
function getTimeString() {
  return new Date().toISOString().substring(11, 19);
}

/**
 * Generate short ID for session files
 */
function shortId() {
  return Math.random().toString(36).substring(2, 8);
}

/**
 * Find files matching a pattern in a directory
 * @param {string} dir - Directory to search
 * @param {string} pattern - Glob-like pattern (supports * wildcard)
 * @param {object} options - { maxAge: days to look back }
 */
function findFiles(dir, pattern, options = {}) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const files = fs.readdirSync(dir);
  const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
  const maxAge = options.maxAge ? options.maxAge * 24 * 60 * 60 * 1000 : Infinity;
  const now = Date.now();

  return files
    .filter(f => regex.test(f))
    .map(f => {
      const fullPath = path.join(dir, f);
      const stat = fs.statSync(fullPath);
      return {
        name: f,
        path: fullPath,
        mtime: stat.mtime,
        age: now - stat.mtime.getTime()
      };
    })
    .filter(f => f.age <= maxAge)
    .sort((a, b) => b.mtime - a.mtime); // Most recent first
}

/**
 * Log message to stderr (visible in hook output)
 */
function log(message) {
  console.error(message);
}

module.exports = {
  getClaudeDir,
  getSessionsDir,
  getLearnedSkillsDir,
  getTempDir,
  ensureDir,
  readFile,
  writeFile,
  appendFile,
  getDateTimeString,
  getDateString,
  getTimeString,
  shortId,
  findFiles,
  log
};
