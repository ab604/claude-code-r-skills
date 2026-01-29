#!/usr/bin/env node
/**
 * Strategic Compact Suggester
 *
 * Suggests manual /compact at strategic points rather than relying on
 * arbitrary auto-compaction which can happen mid-task.
 *
 * Why strategic compaction matters:
 * - Auto-compact happens at arbitrary points, often mid-task
 * - Strategic compacting preserves context through logical phases
 * - Compact after exploration, before execution
 * - Compact after completing a milestone, before starting next
 */

const path = require('path');
const { getTempDir, readFile, writeFile, log } = require('./utils');

async function main() {
  // Use session-specific counter based on session ID or parent PID
  const sessionId = process.env.CLAUDE_SESSION_ID || process.ppid || 'default';
  const counterFile = path.join(getTempDir(), `claude-tool-count-${sessionId}`);
  const threshold = parseInt(process.env.COMPACT_THRESHOLD || '50', 10);

  let count = 1;

  // Read existing count or start at 1
  const existing = readFile(counterFile);
  if (existing) {
    count = parseInt(existing.trim(), 10) + 1;
  }

  // Save updated count
  writeFile(counterFile, String(count));

  // Suggest compact at threshold
  if (count === threshold) {
    log(`[StrategicCompact] ${threshold} tool calls reached - consider /compact if transitioning phases`);
    log('[StrategicCompact] Good times to compact: after exploration, after debugging, before new task');
  }

  // Remind at regular intervals after threshold
  if (count > threshold && count % 25 === 0) {
    log(`[StrategicCompact] ${count} tool calls - good checkpoint for /compact if context is stale`);
  }

  process.exit(0);
}

main().catch(err => {
  console.error('[StrategicCompact] Error:', err.message);
  process.exit(0); // Don't block on errors
});
