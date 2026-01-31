# Claude Code R Skills

A curated collection of Claude Code configurations for modern R use. These skills, rules, commands, and agents help Claude Code understand R best practices and generate idiomatic, high-quality R code. Additionally the rules and commands help with efficient token usage and enforce constraints, and agents can perform specific tasks. Obviously you can fork and adapt any of these to your case-use. I use Positron, but if you are a VSCode user there is also a plugin for R language server for code intelligence.

## Table of Contents

-   [Acknowledgments](#acknowledgments)
-   [Overview](#overview)
-   [Understanding Feature Types](#understanding-feature-types)
    -   [Skills](#skills)
    -   [Commands](#commands)
    -   [Rules](#rules)
    -   [Agents](#agents)
    -   [Hooks](#hooks)
-   [Features](#features)
-   [Installation](#installation)
    -   [Option 1: Plugin Marketplace](#option-1-plugin-marketplace-recommended)
    -   [Option 2: Copy to your project](#option-2-copy-to-your-project)
    -   [Option 3: Copy to user configuration](#option-3-copy-to-user-configuration)
-   [Quick Reference](#quick-reference)
    -   [Essential Modern R Patterns](#essential-modern-r-patterns)
    -   [Key Anti-Patterns to Avoid](#key-anti-patterns-to-avoid)
-   [Directory Structure](#directory-structure)
-   [Core Principles](#core-principles)
-   [Requirements](#requirements)
-   [Environment Management](#environment-management)
-   [License](#license)

## Acknowledgments {#acknowledgments}

This project uses and builds on the work of:

-   [**Sarah Johnson's Modern R Development Guide**](https://gist.github.com/sj-io/3828d64d0969f2a0f05297e59e6c15ad) - Original guide that formed the foundation for the R skills in this repository

-   [**Jeremy Allen's Claude Skills Repo**](https://github.com/jeremy-allen/claude-skills) - Jeremy's Claude Skills mostly derived from Sarah's guide

-   [**Affaan Mustafa's Everything Claude Code**](https://github.com/affaan-m/everything-claude-code) - Framework structure, rules, commands, and agents adapted for R development from Affan's Hackathon winning code

-   [**Posit's testing-r-packages Skill**](https://github.com/posit-dev/skills/tree/main/r-lib/testing-r-packages) - testthat Edition 3 patterns, test design principles, and comprehensive expectations reference incorporated into the tdd-workflow skill

-   As an aside, I use Quarto in my workflow and use [Posit's Quarto plugin](https://github.com/posit-dev/skills) which you can add with: `/plugin marketplace add posit-dev/skills` and then `/plugin install quarto@posit-dev-skills`.

## Overview {#overview}

This repository provides Claude Code configurations specifically for R users, combining:

-   **R-specific skills** for modern tidyverse patterns, rlang, performance, OOP, and more
-   **Development workflow tools** adapted from [everything-claude-code](https://github.com/affaan-m/everything-claude-code)
-   **Testing and quality rules** for R development

## Understanding Feature Types {#understanding-feature-types}

Claude Code uses five types of features to customise its behaviour for R development. Each serves a distinct purpose in the development workflow.

### Skills {#skills}

**What they are:** Markdown documents containing domain knowledge, best practices, and coding patterns that Claude references when writing code. Skills are passive knowledge resources loaded into Claude's context when relevant.

**When to use:** Claude automatically activates skills based on the code you're working on. For example, when you're writing tidyverse code, the `tidyverse-patterns` skill provides guidance on modern pipes, joins, and grouping.

**How they work:** Skills live in `.claude/skills/` and contain detailed guidance, anti-patterns to avoid, and code examples. Claude consults these when making implementation decisions.

**How to use:**

``` bash
# Skills are automatically activated - no manual invocation needed
# You can also explicitly request skill usage in your prompts:
"Write a function using tidyverse-patterns to summarize data by group"
```

### Commands {#commands}

**What they are:** User-invocable shortcuts (prefixed with `/`) that trigger specific workflows or behaviours. Commands are active - you call them explicitly to perform actions.

**When to use:** Use commands when you want Claude to follow a specific workflow, such as planning before implementation (`/plan`) or conducting a code review (`/code-review`).

**How they work:** Commands are defined in the `commands/` directory and can trigger agents, enforce specific behaviours, or structure Claude's responses in particular ways.

**How to use:**

``` bash
# In your Claude Code conversation:
/plan Add bootstrap confidence intervals to model output

# After seeing the plan, respond:
yes  # or "proceed" to start implementation

# Review code before committing:
/code-review
```

### Rules {#rules}

**What they are:** Mandatory constraints and requirements that Claude must follow. Rules enforce project standards like test coverage thresholds, security practices, and git workflows.

**When to use:** Rules are always active - Claude automatically enforces them throughout the session. They're particularly important for maintaining code quality, security, and testing standards.

**How they work:** Rules are markdown files in the `rules/` directory that define requirements (e.g., "80% test coverage required") and constraints (e.g., "never commit credentials"). Claude validates actions against these rules.

**How to use:**

``` bash
# Rules are automatically enforced - no manual invocation needed
# Claude will:
# - Require 80% test coverage (from testing.md)
# - Validate credential handling (from security.md)
# - Format commits correctly (from git-workflow.md)

# You can reference rules explicitly:
"Make sure this follows our testing rules"
```

### Agents {#agents}

**What they are:** Specialized sub-agents with specific roles, expertise, and limited tool access. Agents are focused workers that handle particular types of tasks.

**When to use:** Agents are invoked by commands or automatically by Claude when specialised expertise is needed. The `planner` agent creates implementation plans, while the `code-reviewer` agent analyses code for issues.

**How they work:** Agents are defined in the `agents/` directory with specific tools and prompts. They receive a task, complete it with their specialised knowledge, and return results to the main conversation.

**How to use:**

``` bash
# Agents are typically invoked via commands:
/plan Feature description      # Activates the planner agent
/code-review                   # Activates the code-reviewer agent

# Claude may also invoke agents automatically when appropriate
```

### Hooks {#hooks}

**What they are:** Event-driven JavaScript scripts that execute automatically at specific points in Claude's workflow (e.g., before editing files, on session start/end, before context compaction).

**When to use:** Hooks run automatically in response to events - you don't invoke them directly. They're useful for context management, state persistence, and workflow optimisations.

**How they work:** Hooks are configured in `.claude/hooks/hooks.json` with matchers that define when they trigger. Scripts execute and can modify Claude's behaviour or provide additional context.

**How to use:**

``` bash
# Hooks run automatically. Configured hooks in this repo:
# - suggest-compact: Suggests /compact after 50 tool uses
# - pre-compact: Saves session state before compaction
# - session-start: Reports available history on startup
# - session-end: Persists session state for continuity
# - doc-blocker: Warns about creating random .md files

# Hooks are transparent - you'll see their output in the session:
[Hook] Context window usage: 45/50 tool calls. Consider /compact soon.
```

## Features {#features}

### Skills (8 public + 1 local)

| Skill | Description |
|--------------------------|----------------------------------------------|
| **tidyverse-patterns** | Modern pipes, joins, grouping, purrr, stringr |
| **rlang-patterns** | Data-masking, injection operators, dynamic dots |
| **r-performance** | Profiling, benchmarking, vctrs, optimisation |
| **r-style-guide** | Naming, spacing, function design |
| **r-oop** | S7, S3, S4, vctrs decision guide |
| **r-package-development** | Dependencies, API design, testing |
| **r-bayes** | brms, DAG validation, multilevel models, marginaleffects |
| **tdd-workflow** | Test-driven development with testthat |

*Local-only (not in public repo):*

| Skill                  | Description                                        |
|-----------------------|-------------------------------------------------|
| **r-machine-learning** | XGBoost, LightGBM, CatBoost, TabNet, ensembles, CV |

### Commands

| Command        | Description                               |
|----------------|-------------------------------------------|
| `/plan`        | Create implementation plans before coding |
| `/code-review` | Review code for security and quality      |
| `/tdd`         | Test-driven development workflow          |

### Rules

| Rule             | Description                          |
|------------------|--------------------------------------|
| **security**     | Credential handling, data protection |
| **testing**      | 80% coverage, testthat patterns      |
| **git-workflow** | Commit format, PR workflow           |

### Agents

| Agent             | Description                        |
|-------------------|------------------------------------|
| **planner**       | Implementation planning specialist |
| **code-reviewer** | Security and quality review        |

### Hooks (Context Window Management)

| Hook | Trigger | Description |
|------------------|----------------------|--------------------------------|
| **suggest-compact** | PreToolUse (Edit/Write) | Suggests `/compact` after 50 tool calls, then every 25 |
| **pre-compact** | PreCompact | Saves session state before context compaction |
| **session-start** | SessionStart | Reports available session history and learned skills |
| **session-end** | SessionEnd | Persists session state for continuity |
| **doc-blocker** | PreToolUse (Write .md) | Warns about creating random .md files |

These hooks help optimise context window usage by:

-   Suggesting strategic compaction at logical task boundaries
-   Preserving session state across compaction events
-   Consolidating documentation to reduce context bloat

## Installation {#installation}

### Option 1: Plugin Marketplace (recommended) {#option-1-plugin-marketplace-recommended}

``` bash
# Add the marketplace
/plugin marketplace add ab604/claude-code-r-skills

# Install R skills
/plugin install r-skills@r-skills

# Install R language server (optional, for code intelligence in VS Code/terminal)
# Note: Not needed if using Positron, which has built-in R language server support
/plugin install r-lsp@r-skills
```

The `r-lsp` plugin requires the R languageserver package:

``` r
install.packages(c("languageserver", "lintr", "styler"))
```

See [r-lsp](https://github.com/ab604/r-lsp) for more details.

### Option 2: Copy to your project {#option-2-copy-to-your-project}

``` bash
# Clone this repository
git clone https://github.com/ab604/claude-code-r-skills.git

# Copy to your R project
cp -r claude-code-r-skills/.claude/ /path/to/your/project/
cp -r claude-code-r-skills/rules/ /path/to/your/project/
cp -r claude-code-r-skills/commands/ /path/to/your/project/
cp -r claude-code-r-skills/agents/ /path/to/your/project/
```

### Option 3: Copy to user configuration {#option-3-copy-to-user-configuration}

``` bash
# Copy skills to global config
cp -r .claude/skills/* ~/.claude/skills/

# Copy rules, commands, agents
cp -r rules/* ~/.claude/rules/
cp -r commands/* ~/.claude/commands/
cp -r agents/* ~/.claude/agents/
```

## Quick Reference {#quick-reference}

### Essential Modern R Patterns {#essential-modern-r-patterns}

``` r
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

### Key Anti-Patterns to Avoid {#key-anti-patterns-to-avoid}

``` r
# Avoid legacy magrittr pipe
data %>% filter(x > 0)  # Use |> instead

# Avoid old join syntax
by = c("a" = "b")  # Use join_by(a == b)

# Avoid group_by/ungroup
group_by(x) |> summarise(y) |> ungroup()  # Use .by instead

# Avoid sapply (type-unstable)
sapply(x, f)  # Use map_*() instead
```

## Directory Structure {#directory-structure}

``` text
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

## Core Principles {#core-principles}

1.  **Use modern tidyverse patterns** - dplyr 1.1+, native pipe, current APIs
2.  **Profile before optimising** - Use profvis and bench
3.  **Write readable code first** - Optimize only when necessary
4.  **Follow tidyverse style guide** - Consistent naming and structure
5.  **Test-driven development** - Write tests before implementation
6.  **80% minimum coverage** - Comprehensive testing required

## Requirements {#requirements}

-   R 4.3+ (for native pipe `|>`)
-   dplyr 1.1+ (for `.by`, `join_by()`, `reframe()`)
-   purrr 1.0+ (for `list_rbind()`)
-   tidyr 1.3+ (for `separate_wider_*()`)
-   testthat 3.0+ (for snapshot testing)

## Environment Management {#environment-management}

-   **R packages**: Use `pak` for installation
-   **R environments**: Use `renv` for project isolation
-   **Python**: Use `uv` for Python environments (if needed)

## License {#license}

MIT License - see [LICENSE](LICENSE) for details.
