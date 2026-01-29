# Modern R Development Guide

*This document captures current best practices for R development. For detailed guidance, refer to the skill files below.*

## Core Principles

1. **Use modern tidyverse patterns** - Prioritize dplyr 1.1+ features, native pipe, and current APIs
2. **Profile before optimizing** - Use profvis and bench to identify real bottlenecks
3. **Write readable code first** - Optimize only when necessary and after profiling
4. **Follow tidyverse style guide** - Consistent naming, spacing, and structure
5. **Bayesian Inference** - Use brms and marginaleffects

## Package and Environment Management

For R packages use pak and for R environments use renv

## R Development Skills

For detailed guidance on specific topics, refer to these skill files:

| Topic | Skill File | Description |
|------------------|--------------------------|----------------------------|
| **Tidyverse Patterns** | [tidyverse-patterns](skills/tidyverse-patterns/SKILL.md) | Modern pipes, joins, grouping, purrr, stringr |
| **rlang Metaprogramming** | [rlang-patterns](skills/rlang-patterns/SKILL.md) | Data-masking, injection operators, dynamic dots |
| **Performance** | [r-performance](skills/r-performance/SKILL.md) | Profiling, benchmarking, vctrs, optimization |
| **Style Guide** | [r-style-guide](skills/r-style-guide/SKILL.md) | Naming, spacing, function design |
| **OOP Systems** | [r-oop](skills/r-oop/SKILL.md) | S7, S3, S4, vctrs decision guide |
| **Package Development** | [r-package-development](skills/r-package-development/SKILL.md) | Dependencies, API design, testing |
| **Bayesian Inference** | [r-bayes](skills/r-bayes/SKILL.md) | Bayesian Inference in R |

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

## Python

Use uv for python environment.
