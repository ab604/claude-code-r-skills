---
name: plan
description: Create an implementation plan before writing code. Use for new features, architectural changes, or complex refactoring.
---

# /plan - Implementation Planning

Use the planner agent to create a comprehensive implementation plan before writing any code.

## When to Use

- New features or functionality
- Architectural changes
- Complex refactoring
- Multi-file modifications
- When requirements need clarification

## What the Planner Does

1. **Restate Requirements** - Clarify what needs to be built
2. **Identify Risks** - Surface potential issues and blockers
3. **Create Step Plan** - Break down implementation into phases
4. **Define Success Criteria** - How to verify completion

## The planner agent will NOT write any code until you explicitly confirm the plan.

## Example Usage

```
/plan Add bootstrap confidence intervals to the model summary output
```

## Response Options

After receiving a plan, respond with:

- **"yes" / "proceed"** - Confirm and start implementation
- **"modify: [changes]"** - Request specific modifications
- **"alternative: [approach]"** - Propose a different approach

## Plan Format

The planner will provide:

```markdown
# Implementation Plan: [Feature Name]

## Overview
[Summary of what will be built]

## Requirements
- [Requirement 1]
- [Requirement 2]

## Implementation Steps

### Phase 1: [Phase Name]
1. [Step with file path and action]
2. [Step with file path and action]

### Phase 2: [Phase Name]
...

## Testing Strategy
- Unit tests: [what to test]
- Integration tests: [what to verify]

## Risks & Mitigations
- **Risk**: [Description]
  - Mitigation: [How to address]

## Success Criteria
- [ ] Criterion 1
- [ ] Criterion 2
```

## Related Commands

- `/tdd` - Test-driven development workflow
- `/code-review` - Review code for quality issues
