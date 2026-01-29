# Claude Code R Skills

A curated collection of Claude Code skills for modern R development. These skills help Claude Code understand R best practices and generate idiomatic, high-quality R code.

## Overview

This repository contains Claude Code configurations specifically designed for R developers. The skills cover:

- **Modern tidyverse patterns** (dplyr 1.1+, purrr 1.0+, native pipe)
- **Metaprogramming with rlang** (data-masking, tidy evaluation)
- **Performance optimization** (profiling, benchmarking, vctrs)
- **Code style** (tidyverse style guide, function design)
- **Object-oriented programming** (S7, S3, S4, vctrs)
- **Package development** (dependencies, API design, testing)
- **Bayesian inference** (brms, tidybayes, marginaleffects)

## Installation

### Option 1: Copy to your project (recommended)

Copy the `.claude/` directory to your R project:

```bash
cp -r .claude/ /path/to/your/project/
```

### Option 2: Copy to user configuration

Copy to your global Claude Code configuration:

```bash
# Linux/macOS
cp -r .claude/skills/* ~/.claude/skills/

# Or copy the entire .claude directory
cp -r .claude/ ~/
```

## Skills Reference

| Skill | Description | Use When |
|-------|-------------|----------|
| **tidyverse-patterns** | Modern pipes, joins, grouping, purrr, stringr | Writing tidyverse R code |
| **rlang-patterns** | Data-masking, injection operators, dynamic dots | Writing functions with tidy evaluation |
| **r-performance** | Profiling, benchmarking, vctrs, optimization | Optimizing R code |
| **r-style-guide** | Naming, spacing, function design | Writing any R code |
| **r-oop** | S7, S3, S4, vctrs decision guide | Designing R classes |
| **r-package-development** | Dependencies, API design, testing | Developing R packages |
| **r-bayes** | brms, tidybayes, marginaleffects | Bayesian inference |

## Quick Reference

### Essential Modern Patterns

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

## Core Principles

1. **Use modern tidyverse patterns** - Prioritize dplyr 1.1+ features, native pipe, and current APIs
2. **Profile before optimizing** - Use profvis and bench to identify real bottlenecks
3. **Write readable code first** - Optimize only when necessary and after profiling
4. **Follow tidyverse style guide** - Consistent naming, spacing, and structure
5. **Bayesian inference** - Use brms and marginaleffects

## Environment Management

- **R packages**: Use `pak` for installation
- **R environments**: Use `renv` for project isolation
- **Python**: Use `uv` for Python environments (if needed)

## Directory Structure

```
.claude/
├── CLAUDE.md           # Project instructions for Claude Code
└── skills/
    ├── tidyverse-patterns/
    │   └── SKILL.md
    ├── rlang-patterns/
    │   └── SKILL.md
    ├── r-performance/
    │   └── SKILL.md
    ├── r-style-guide/
    │   └── SKILL.md
    ├── r-oop/
    │   └── SKILL.md
    ├── r-package-development/
    │   └── SKILL.md
    └── r-bayes/
        └── SKILL.md
```

## Requirements

- R 4.3+ (for native pipe `|>`)
- dplyr 1.1+ (for `.by`, `join_by()`, `reframe()`)
- purrr 1.0+ (for `list_rbind()`, `in_parallel()`)
- tidyr 1.3+ (for `separate_wider_*()`)

## Contributing

Contributions welcome! Please ensure any new skills:

1. Follow the existing SKILL.md format with YAML frontmatter
2. Include practical code examples
3. Highlight modern patterns over legacy approaches
4. Include "when to use" and "when to avoid" guidance

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

Inspired by [everything-claude-code](https://github.com/affaan-m/everything-claude-code) by Affaan M.
