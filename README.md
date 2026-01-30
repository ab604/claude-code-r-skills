# Claude Code R Skills

A curated collection of Claude Code configurations for modern R development. These skills, rules, commands, and agents help Claude Code understand R best practices and generate idiomatic, high-quality R code.

## Acknowledgments

This project uses and builds on the work of:

- **[Sarah Johnson's Modern R Development Guide](https://gist.github.com/sj-io/3828d64d0969f2a0f05297e59e6c15ad)** - Original guide that formed the foundation for the R skills in this repository
- **[Affaan Mustafa's Everything Claude Code](https://github.com/affaan-m/everything-claude-code)** - Framework structure, rules, commands, and agents adapted for R development from Affan's Hackathon winning code.

## Overview

This repository provides Claude Code configurations specifically designed for R developers, combining:

- **R-specific skills** for modern tidyverse patterns, rlang, performance, OOP, and more
- **Development workflow tools** adapted from [everything-claude-code](https://github.com/affaan-m/everything-claude-code)
- **Testing and quality rules** for professional R development

## Features

### Skills (8 public + 1 local)

| Skill | Description |
|-------|-------------|
| **tidyverse-patterns** | Modern pipes, joins, grouping, purrr, stringr |
| **rlang-patterns** | Data-masking, injection operators, dynamic dots |
| **r-performance** | Profiling, benchmarking, vctrs, optimization |
| **r-style-guide** | Naming, spacing, function design |
| **r-oop** | S7, S3, S4, vctrs decision guide |
| **r-package-development** | Dependencies, API design, testing |
| **r-bayes** | brms, DAG validation, multilevel models, marginaleffects |
| **tdd-workflow** | Test-driven development with testthat |

*Local-only (not in public repo):*

| Skill                  | Description                                        |
|------------------------|----------------------------------------------------|
| **r-machine-learning** | XGBoost, LightGBM, CatBoost, TabNet, ensembles, CV |

### Commands

| Command | Description |
|---------|-------------|
| `/plan` | Create implementation plans before coding |
| `/code-review` | Review code for security and quality |
| `/tdd` | Test-driven development workflow |

### Rules

| Rule | Description |
|------|-------------|
| **security** | Credential handling, data protection |
| **testing** | 80% coverage, testthat patterns |
| **git-workflow** | Commit format, PR workflow |

### Agents

| Agent | Description |
|-------|-------------|
| **planner** | Implementation planning specialist |
| **code-reviewer** | Security and quality review |

### Hooks (Context Window Management)

| Hook | Trigger | Description |
|------|---------|-------------|
| **suggest-compact** | PreToolUse (Edit/Write) | Suggests `/compact` after 50 tool calls, then every 25 |
| **pre-compact** | PreCompact | Saves session state before context compaction |
| **session-start** | SessionStart | Reports available session history and learned skills |
| **session-end** | SessionEnd | Persists session state for continuity |
| **doc-blocker** | PreToolUse (Write .md) | Warns about creating random .md files |

These hooks help optimize context window usage by:

- Suggesting strategic compaction at logical task boundaries
- Preserving session state across compaction events
- Consolidating documentation to reduce context bloat

## Installation

### Option 1: Plugin Marketplace (recommended)

```bash
# Add the marketplace
/plugin marketplace add ab604/claude-code-r-skills

# Install R skills
/plugin install r-skills@ab604-claude-code-r-skills

# Install R language server (optional, for code intelligence)
/plugin install r-lsp@ab604-claude-code-r-skills
```

The `r-lsp` plugin requires the R languageserver package:

```r
install.packages(c("languageserver", "lintr", "styler"))
```

### Option 2: Copy to your project

```bash
# Clone this repository
git clone https://github.com/ab604/claude-code-r-skills.git

# Copy to your R project
cp -r claude-code-r-skills/.claude/ /path/to/your/project/
cp -r claude-code-r-skills/rules/ /path/to/your/project/
cp -r claude-code-r-skills/commands/ /path/to/your/project/
cp -r claude-code-r-skills/agents/ /path/to/your/project/
```

### Option 3: Copy to user configuration

```bash
# Copy skills to global config
cp -r .claude/skills/* ~/.claude/skills/

# Copy rules, commands, agents
cp -r rules/* ~/.claude/rules/
cp -r commands/* ~/.claude/commands/
cp -r agents/* ~/.claude/agents/
```

## Quick Reference

### Essential Modern R Patterns

```r
# Always use native pipe
data |> filter(x > 0) |> summarise(mean(y))

# Modern joins with join_by()
inner_join(x, y, by = join_by(a == b))

# Per-operation grouping with .by
summarise(data, mean(value), .by = category)

# Embrace for function arguments
my_func <- function(data, var) {
  data |> summarise(mean = mean({{ var }}))
}

# Type-stable iteration
map_dbl(data, mean)  # Not sapply()
```

### Key Anti-Patterns to Avoid

```r
# Avoid legacy magrittr pipe
data %>% filter(x > 0)  # Use |> instead

# Avoid old join syntax
by = c("a" = "b")  # Use join_by(a == b)

# Avoid group_by/ungroup
group_by(x) |> summarise(y) |> ungroup()  # Use .by instead

# Avoid sapply (type-unstable)
sapply(x, f)  # Use map_*() instead
```

## Directory Structure

```text
claude-code-r-skills/
├── README.md
├── LICENSE
├── .gitignore
├── .claude-plugin/
│   ├── plugin.json                  # Plugin manifest
│   └── marketplace.json             # Marketplace catalog
├── .claude/
│   ├── CLAUDE.md                    # Project instructions
│   ├── hooks/
│   │   ├── hooks.json               # Hook configuration
│   │   └── scripts/
│   │       ├── utils.js             # Shared utilities
│   │       ├── suggest-compact.js   # Strategic compaction
│   │       ├── pre-compact.js       # Save state before compact
│   │       ├── session-start.js     # Load previous context
│   │       └── session-end.js       # Persist session state
│   └── skills/
│       ├── tidyverse-patterns/
│       ├── rlang-patterns/
│       ├── r-performance/
│       ├── r-style-guide/
│       ├── r-oop/
│       ├── r-package-development/
│       ├── r-bayes/
│       └── tdd-workflow/
├── rules/
│   ├── security.md
│   ├── testing.md
│   └── git-workflow.md
├── commands/
│   ├── plan.md
│   ├── code-review.md
│   └── tdd.md
└── agents/
    ├── planner.md
    └── code-reviewer.md
```

Note: `r-machine-learning` skill is local-only and not included in the public repository.

## Core Principles

1. **Use modern tidyverse patterns** - dplyr 1.1+, native pipe, current APIs
2. **Profile before optimizing** - Use profvis and bench
3. **Write readable code first** - Optimize only when necessary
4. **Follow tidyverse style guide** - Consistent naming and structure
5. **Test-driven development** - Write tests before implementation
6. **80% minimum coverage** - Comprehensive testing required

## Requirements

- R 4.3+ (for native pipe `|>`)
- dplyr 1.1+ (for `.by`, `join_by()`, `reframe()`)
- purrr 1.0+ (for `list_rbind()`)
- tidyr 1.3+ (for `separate_wider_*()`)
- testthat 3.0+ (for snapshot testing)

## Environment Management

- **R packages**: Use `pak` for installation
- **R environments**: Use `renv` for project isolation
- **Python**: Use `uv` for Python environments (if needed)

## License

MIT License - see [LICENSE](LICENSE) for details.
