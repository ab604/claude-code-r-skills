---
name: code-review
description: Review code for security, quality, and best practices. Use after writing code and before committing.
---

# /code-review - Code Quality Review

Review uncommitted code changes for security vulnerabilities, code quality issues, and R best practices.

## Review Process

1. **Identify Changes** - `git diff --name-only HEAD`
2. **Review Each File** - Check against criteria below
3. **Generate Report** - Severity-rated findings
4. **Block or Approve** - Based on issue severity

## Review Categories

### Security

- [ ] No hardcoded credentials (API keys, passwords, tokens)
- [ ] No sensitive data exposure in outputs or logs
- [ ] Safe file path handling
- [ ] Parameterized database queries
- [ ] Input validation in Shiny/Plumber apps

### Code Quality (R-Specific)

- [ ] Functions under 50 lines
- [ ] Files under 400 lines (ideally 200-300)
- [ ] No deep nesting (max 4 levels)
- [ ] Proper error handling with informative messages
- [ ] Type-stable outputs (avoid sapply, use map_*)
- [ ] Modern tidyverse patterns (native pipe, .by, join_by)

### Best Practices

- [ ] Meaningful variable and function names (snake_case)
- [ ] No code duplication
- [ ] Tests included for new functionality
- [ ] Documentation for exported functions
- [ ] No global state modification

## Severity Levels

| Level | Action | Examples |
|-------|--------|----------|
| **CRITICAL** | Must fix before commit | Hardcoded secrets, SQL injection |
| **HIGH** | Should fix before commit | Missing error handling, no tests |
| **MEDIUM** | Fix when possible | Style issues, minor refactoring |
| **LOW** | Consider for improvement | Documentation, naming suggestions |

## Report Format

```markdown
## Code Review: [files reviewed]

### CRITICAL Issues
- **[file:line]** - [description]
  - Fix: [suggested fix]

### HIGH Issues
- **[file:line]** - [description]

### MEDIUM Issues
- **[file:line]** - [description]

### Suggestions
- [improvement ideas]

## Verdict: APPROVED / NEEDS CHANGES
```

## Blocking Criteria

**Block commit if:**
- Any CRITICAL issues found
- More than 2 HIGH issues found
- Security vulnerabilities present

**Approve with caution if:**
- Only MEDIUM/LOW issues
- Clear plan to address in follow-up

## R-Specific Checks

```r
# Check for anti-patterns
- data %>% filter()           # Use |> instead
- sapply(x, f)                # Use map_*() instead
- group_by() |> ungroup()     # Use .by instead
- by = c("a" = "b")          # Use join_by() instead

# Check for good patterns
+ data |> filter()            # Native pipe
+ map_dbl(x, f)              # Type-stable
+ summarise(..., .by = group) # Per-operation grouping
+ inner_join(x, y, join_by()) # Modern join syntax
```

## Usage

```
/code-review
```

Review will automatically check all uncommitted changes.
