---
name: tdd
description: Test-driven development workflow for R. Write tests first, then implement. Use for new features, bug fixes, and refactoring.
---

# /tdd - Test-Driven Development for R

Follow the TDD workflow: write tests first, then implement code to make them pass.

## Core Methodology

**RED → GREEN → REFACTOR**

1. **RED** - Write a failing test
2. **GREEN** - Write minimal code to pass
3. **REFACTOR** - Improve while keeping tests green

## When to Use

- New features or functions
- Bug fixes (write test that reproduces bug first)
- Refactoring existing code
- Adding new model types or algorithms
- Creating data processing pipelines

## TDD Workflow Steps

### Step 1: Define Expected Behavior

```r
# What should the function do?
# rescale01: Rescale a numeric vector to [0, 1] range
# - Minimum value maps to 0
# - Maximum value maps to 1
# - Handle NA values appropriately
```

### Step 2: Write Failing Tests

```r
# tests/testthat/test-rescale.R
library(testthat)

test_that("rescale01 maps to [0, 1] range", {
  expect_equal(rescale01(c(0, 5, 10)), c(0, 0.5, 1))
  expect_equal(rescale01(c(-10, 0, 10)), c(0, 0.5, 1))
})

test_that("rescale01 handles edge cases", {
  expect_equal(rescale01(c(5, 5, 5)), c(NaN, NaN, NaN))
  expect_equal(rescale01(numeric(0)), numeric(0))
})

test_that("rescale01 handles NA values", {
  expect_equal(rescale01(c(0, NA, 10)), c(0, NA, 1))
})
```

### Step 3: Run Tests (They Should Fail)

```r
devtools::test()
# ✖ rescale01 maps to [0, 1] range
# ✖ rescale01 handles edge cases
# ✖ rescale01 handles NA values
```

### Step 4: Implement Minimal Code

```r
# R/rescale.R
rescale01 <- function(x) {
  rng <- range(x, na.rm = TRUE)
  (x - rng[1]) / (rng[2] - rng[1])
}
```

### Step 5: Run Tests Again

```r
devtools::test()
# ✔ rescale01 maps to [0, 1] range
# ✔ rescale01 handles edge cases
# ✔ rescale01 handles NA values
```

### Step 6: Refactor

Improve code while keeping tests green:

```r
rescale01 <- function(x, na.rm = TRUE) {
  rng <- range(x, na.rm = na.rm, finite = TRUE)
  (x - rng[1]) / (rng[2] - rng[1])
}
```

### Step 7: Verify Coverage

```r
covr::package_coverage()
# rescale01: 100% coverage
```

## Coverage Standards

| Code Type | Minimum Coverage |
|-----------|-----------------|
| General code | 80% |
| Statistical calculations | 100% |
| Data validation | 100% |
| Security functions | 100% |
| Core business logic | 100% |

## Test Patterns

### Testing Data Transformations

```r
test_that("clean_data removes invalid rows", {
  input <- tibble(
    id = 1:4,
    value = c(1, NA, 3, -999)
  )

  result <- clean_data(input)

  expect_equal(nrow(result), 2)
  expect_equal(result$id, c(1, 3))
})
```

### Testing Model Functions

```r
test_that("fit_model returns expected structure", {
  data <- tibble(x = 1:10, y = 2 * 1:10 + rnorm(10))

  model <- fit_model(data, y ~ x)

  expect_s3_class(model, "lm")
  expect_named(coef(model), c("(Intercept)", "x"))
})
```

### Testing Error Handling

```r
test_that("validate_input throws informative errors", {
  expect_error(
    validate_input(NULL),
    class = "validation_error"
  )

  expect_snapshot(
    validate_input("not numeric"),
    error = TRUE
  )
})
```

## Common Mistakes to Avoid

**DON'T:**
- Write implementation before tests
- Skip running tests between changes
- Test implementation details instead of behavior
- Modify tests to pass instead of fixing code

**DO:**
- Write the simplest test first
- Run tests after every change
- Test observable behavior and outputs
- Keep tests independent and fast

## Related Commands

- `/plan` - Plan implementation before starting
- `/code-review` - Review code after implementation

## Running Tests

```r
# All tests
devtools::test()

# With coverage
covr::package_coverage()

# Specific file
testthat::test_file("tests/testthat/test-rescale.R")

# Watch mode
testthat::auto_test_package()
```

**Remember: Tests are not optional. Write them FIRST.**
