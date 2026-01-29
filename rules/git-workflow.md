# Git Workflow

## Commit Message Format

```
<type>: <description>

<optional body>
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`

Examples:
- `feat: add bootstrap confidence intervals to model summary`
- `fix: handle NA values in rescale01 function`
- `refactor: simplify data cleaning pipeline`
- `docs: update README with installation instructions`
- `test: add edge case tests for validation functions`

## Pull Request Workflow

When creating PRs:

1. **Analyze full commit history** (not just latest commit)
2. **Use `git diff [base-branch]...HEAD`** to see all changes
3. **Draft comprehensive PR summary** explaining the why
4. **Include test plan** with verification steps
5. **Push with `-u` flag** if new branch

## Feature Implementation Workflow

### 1. Plan First

- Create implementation plan before coding
- Identify dependencies and risks
- Break down into phases

### 2. TDD Approach

- Write tests first (RED)
- Implement to pass tests (GREEN)
- Refactor (IMPROVE)
- Verify 80%+ coverage

### 3. Code Review

- Review code immediately after writing
- Address CRITICAL and HIGH issues
- Fix MEDIUM issues when possible

### 4. Commit & Push

- Detailed commit messages
- Follow conventional commits format
- Reference issues when applicable

## Branch Naming

```
feature/add-bootstrap-ci
fix/na-handling-rescale
refactor/cleanup-data-pipeline
docs/update-readme
```

## R-Specific Git Practices

### Files to Commit

```
R/                    # R source files
tests/                # Test files
man/                  # Documentation (if generated)
DESCRIPTION           # Package metadata
NAMESPACE             # Package exports
.Rbuildignore         # Build ignore rules
```

### Files to Ignore (add to .gitignore)

```
# R artifacts
.Rhistory
.Rdata
.RData
*.Rproj.user
.httr-oauth

# Package build artifacts
*.tar.gz
*.Rcheck/

# renv
renv/library/
renv/local/
renv/staging/

# Data files (typically)
data/raw/
*.csv
*.xlsx
*.parquet

# Rendered outputs
*.html
*.pdf
*_files/

# Credentials
.Renviron
```

## Before Committing Checklist

- [ ] `devtools::check()` passes with no errors
- [ ] `devtools::test()` all tests pass
- [ ] `lintr::lint_package()` no style issues
- [ ] No hardcoded secrets or sensitive data
- [ ] Commit message follows format
- [ ] Related tests included

## Useful Git Commands for R Projects

```bash
# Check what will be committed
git diff --cached

# Stage specific files
git add R/new_function.R tests/testthat/test-new_function.R

# Commit with message
git commit -m "feat: add new_function with tests"

# View recent commits
git log --oneline -10

# Create feature branch
git checkout -b feature/my-new-feature
```
