---
name: tdd-workflow
description: Test-driven development workflow for R using testthat. Use when writing new features, fixing bugs, or refactoring code. Enforces test-first development with 80%+ coverage.
---

# Test-Driven Development Workflow for R

This skill ensures all R code development follows TDD principles with comprehensive test coverage using testthat.

## When to Activate

- Writing new functions or features
- Fixing bugs or issues
- Refactoring existing code
- Adding new model types
- Creating data processing pipelines
- Building Shiny components

## Core Principles

### 1. Tests BEFORE Code

ALWAYS write tests first, then implement code to make tests pass.

### 2. Coverage Requirements

- Minimum 80% coverage (unit + integration)
- 100% coverage for statistical calculations
- 100% coverage for data validation
- All edge cases covered
- Error scenarios tested

### 3. Test Types

#### Unit Tests

Individual functions and utilities:

```r
test_that("rescale01 normalizes to [0, 1] range", {
  expect_equal(rescale01(c(0, 5, 10)), c(0, 0.5, 1))
  expect_equal(rescale01(c(-10, 0, 10)), c(0, 0.5, 1))
})

test_that("rescale01 handles edge cases", {
  expect_equal(rescale01(c(5, 5, 5)), c(NaN, NaN, NaN))
  expect_equal(rescale01(numeric(0)), numeric(0))
  expect_equal(rescale01(c(0, NA, 10)), c(0, NA, 1))
})
```

#### Integration Tests

Function interactions and workflows:

```r
test_that("data pipeline produces expected output", {
  raw_data <- read_fixture("sample_input.csv")

  result <- raw_data |>
    clean_data() |>
    transform_features() |>
    summarize_results()

  expect_s3_class(result, "tbl_df")
  expect_named(result, c("group", "mean", "sd", "n"))
  expect_true(all(result$n > 0))
})
```

#### Snapshot Tests

For complex outputs:

```r
test_that("model summary format is stable", {
  model <- fit_model(test_data)
  expect_snapshot(print(summary(model)))
})

test_that("error messages are informative", {
  expect_snapshot(
    validate_input(invalid_data),
    error = TRUE
  )
})
```

## TDD Workflow Steps

### Step 1: Define Expected Behavior

Document what the function should do:

```r
# Function: calculate_ci
# Purpose: Calculate bootstrap confidence intervals
# Inputs:
#   - data: numeric vector
#   - conf_level: confidence level (default 0.95)
#   - n_boot: number of bootstrap samples (default 1000)
# Outputs:
#   - Named numeric vector with lower and upper bounds
# Edge cases:
#   - Handle NA values
#   - Error on non-numeric input
#   - Error on empty input
```

### Step 2: Write Failing Tests

```r
# tests/testthat/test-calculate_ci.R
library(testthat)

test_that("calculate_ci returns correct structure", {
  set.seed(123)
  result <- calculate_ci(1:100)

  expect_type(result, "double")
  expect_named(result, c("lower", "upper"))
  expect_true(result["lower"] < result["upper"])
})

test_that("calculate_ci respects confidence level", {
  set.seed(123)
  ci_95 <- calculate_ci(1:100, conf_level = 0.95)
  ci_99 <- calculate_ci(1:100, conf_level = 0.99)

  # 99% CI should be wider

  expect_true(ci_99["upper"] - ci_99["lower"] > ci_95["upper"] - ci_95["lower"])
})

test_that("calculate_ci handles NA values", {
  set.seed(123)
  result <- calculate_ci(c(1:100, NA, NA))

  expect_false(any(is.na(result)))
})

test_that("calculate_ci validates inputs", {
  expect_error(calculate_ci("not numeric"), class = "validation_error")
  expect_error(calculate_ci(numeric(0)), class = "validation_error")
  expect_error(calculate_ci(1:10, conf_level = 1.5), class = "validation_error")
})
```

### Step 3: Run Tests (They Should Fail)

```r
devtools::test()
# ✖ calculate_ci returns correct structure
# ✖ calculate_ci respects confidence level
# ✖ calculate_ci handles NA values
# ✖ calculate_ci validates inputs
```

### Step 4: Implement Minimal Code

```r
# R/calculate_ci.R

#' Calculate Bootstrap Confidence Interval
#'
#' @param x Numeric vector
#' @param conf_level Confidence level (default 0.95)
#' @param n_boot Number of bootstrap samples (default 1000)
#' @return Named numeric vector with lower and upper bounds
#' @export
calculate_ci <- function(x, conf_level = 0.95, n_boot = 1000) {
  # Validate inputs

  if (!is.numeric(x)) {
    cli::cli_abort("{.arg x} must be numeric", class = "validation_error")
  }
  if (length(x) == 0) {
    cli::cli_abort("{.arg x} cannot be empty", class = "validation_error")
  }
  if (conf_level <= 0 || conf_level >= 1) {
    cli::cli_abort("{.arg conf_level} must be between 0 and 1", class = "validation_error")
  }

  # Remove NA values

  x <- x[!is.na(x)]

  # Bootstrap
  boot_means <- replicate(n_boot, mean(sample(x, replace = TRUE)))

  # Calculate quantiles
  alpha <- 1 - conf_level
  c(
    lower = unname(quantile(boot_means, alpha / 2)),
    upper = unname(quantile(boot_means, 1 - alpha / 2))
  )
}
```

### Step 5: Run Tests Again

```r
devtools::test()
# ✔ calculate_ci returns correct structure
# ✔ calculate_ci respects confidence level
# ✔ calculate_ci handles NA values
# ✔ calculate_ci validates inputs
```
### Step 6: Refactor

Improve while keeping tests green:

```r
# Extract validation to helper
validate_ci_inputs <- function(x, conf_level) {
  if (!is.numeric(x)) {
    cli::cli_abort("{.arg x} must be numeric", class = "validation_error")
  }
  # ... more validation
}
```

### Step 7: Verify Coverage

```r
covr::package_coverage()
# calculate_ci.R: 100%
```

## Test File Organization

```
tests/
├── testthat/
│   ├── test-validation.R      # Input validation tests
│   ├── test-transformations.R # Data transformation tests
│   ├── test-models.R          # Model fitting tests
│   ├── test-output.R          # Output format tests
│   ├── helper-fixtures.R      # Shared test fixtures
│   ├── helper-mocks.R         # Mock objects
│   └── fixtures/              # Test data files
│       ├── sample_input.csv
│       └── expected_output.rds
└── testthat.R                 # Test runner
```

## Testing Patterns

### Testing Data Transformations

```r
test_that("clean_data removes invalid rows", {
  input <- tibble(
    id = 1:4,
    value = c(1, NA, 3, -999)
  )

  result <- clean_data(input, invalid_value = -999)

  expect_equal(nrow(result), 2)
  expect_equal(result$id, c(1, 3))
  expect_false(anyNA(result$value))
})
```

### Testing Statistical Functions

```r
test_that("weighted_mean matches manual calculation", {
  x <- c(1, 2, 3)
  w <- c(1, 2, 1)

  result <- weighted_mean(x, w)
  expected <- sum(x * w) / sum(w)  # (1 + 4 + 3) / 4 = 2

  expect_equal(result, expected)
})
```

### Testing with Fixtures

```r
# helper-fixtures.R
read_fixture <- function(name) {
  path <- testthat::test_path("fixtures", name)
  readr::read_csv(path, show_col_types = FALSE)
}

# test-pipeline.R
test_that("pipeline handles real data", {
  input <- read_fixture("sample_data.csv")
  result <- process_pipeline(input)

  expect_snapshot(result)
})
```

### Mocking External Dependencies

```r
test_that("fetch_data handles API errors", {
  # Mock the API call

  local_mocked_bindings(
    httr2_request = function(...) {
      stop("API unavailable")
    }
  )

  expect_error(
    fetch_data("endpoint"),
    "API unavailable"
  )
})
```

## Coverage Verification

```r
# Run coverage report
covr::package_coverage()

# Detailed report
covr::report()

# Check specific thresholds
cov <- covr::package_coverage()
pct <- covr::percent_coverage(cov)
if (pct < 80) {
  stop("Coverage below 80%: ", round(pct, 1), "%")
}
```

## Common Testing Mistakes to Avoid

### WRONG: Testing Implementation Details

```r
# Don't test internal state
expect_equal(obj$internal_cache, expected_cache)
```

### CORRECT: Test Behavior

```r
# Test observable behavior
expect_equal(get_result(obj), expected_result)
```

### WRONG: Brittle Tests

```r
# Breaks on any output change
expect_equal(as.character(result), "Mean: 5.234567890")
```

### CORRECT: Flexible Assertions

```r
# Robust to formatting changes
expect_equal(result$mean, 5.23, tolerance = 0.01)
```

### WRONG: Dependent Tests

```r
test_that("creates data", { global_data <<- create() })
test_that("uses data", { process(global_data) })  # Depends on previous!
```

### CORRECT: Independent Tests

```r
test_that("creates and uses data", {
  data <- create()
  result <- process(data)
  expect_true(is_valid(result))
})
```

## Running Tests

```r
# All tests
devtools::test()

# With coverage
covr::package_coverage()

# Specific file
testthat::test_file("tests/testthat/test-validation.R")

# Watch mode
testthat::auto_test_package()

# Verbose output
devtools::test(reporter = "progress")
```

## Success Metrics

- 80%+ code coverage achieved
- All tests passing
- No skipped tests
- Fast execution (< 30s for unit tests)
- Tests catch bugs before production
- Confident refactoring enabled

---

**Remember**: Tests are not optional. They are the safety net that enables confident refactoring, rapid development, and production reliability. Write them FIRST.
