# Testing Requirements for R Projects

## Coverage Requirements

- **Minimum 80% test coverage** for all code
- **100% coverage required** for:
  - Statistical calculations and models
  - Data validation functions
  - Critical business logic
  - Security-related functions

## Test Types

### Unit Tests (testthat)

Test individual functions in isolation:

```r
library(testthat)

test_that("calculate_mean handles NA values correctly", {
  expect_equal(calculate_mean(c(1, 2, NA, 4), na.rm = TRUE), 7/3)
  expect_equal(calculate_mean(c(1, 2, NA, 4), na.rm = FALSE), NA_real_)
})

test_that("calculate_mean validates inputs", {
  expect_error(calculate_mean("not numeric"), class = "validation_error")
  expect_error(calculate_mean(NULL), class = "validation_error")
})
```

### Integration Tests

Test function interactions and workflows:

```r
test_that("data pipeline produces expected output", {
  raw_data <- read_test_fixture("sample_input.csv")

  result <- raw_data |>
    clean_data() |>
    transform_features() |>
    summarize_results()

  expect_s3_class(result, "tbl_df")
  expect_named(result, c("group", "mean", "sd", "n"))
  expect_true(all(result$n > 0))
})
```

### Snapshot Tests

For complex outputs that are hard to specify:

```r
test_that("summary output matches expected format", {
  model <- fit_model(test_data)
  expect_snapshot(summary(model))
})

test_that("error messages are informative", {
  expect_snapshot(
    process_data(invalid_input),
    error = TRUE
  )
})
```

## Test-Driven Development Workflow

1. **RED** - Write a failing test first
2. **GREEN** - Write minimal code to pass the test
3. **REFACTOR** - Improve code while keeping tests green
4. **COVERAGE** - Verify 80%+ coverage maintained

```r
# 1. Write test first (RED)
test_that("rescale01 normalizes to [0, 1] range", {
  expect_equal(rescale01(c(0, 5, 10)), c(0, 0.5, 1))
})

# 2. Implement to pass (GREEN)
rescale01 <- function(x) {
  rng <- range(x, na.rm = TRUE)
  (x - rng[1]) / (rng[2] - rng[1])
}

# 3. Add edge cases and refactor
test_that("rescale01 handles edge cases", {
  expect_equal(rescale01(c(5, 5, 5)), c(NaN, NaN, NaN))  # constant input
  expect_equal(rescale01(numeric(0)), numeric(0))        # empty input
})
```

## Test File Organization

```
tests/
├── testthat/
│   ├── test-validation.R      # Input validation tests
│   ├── test-processing.R      # Data processing tests
│   ├── test-models.R          # Model fitting tests
│   ├── test-output.R          # Output format tests
│   ├── helper-fixtures.R      # Shared test fixtures
│   └── fixtures/              # Test data files
│       ├── sample_input.csv
│       └── expected_output.rds
└── testthat.R                 # Test runner
```

## Running Tests

```r
# Run all tests
devtools::test()

# Run with coverage
covr::package_coverage()

# Run specific test file
testthat::test_file("tests/testthat/test-validation.R")

# Continuous testing during development
testthat::auto_test_package()
```

## When Tests Fail

1. **Do NOT modify tests** to make them pass (unless the test is wrong)
2. **Fix the implementation** to match expected behavior
3. **Add more tests** if the failure reveals missing coverage
4. **Update snapshots** only if the change is intentional

## Best Practices

1. **One concept per test** - Test single behaviors, not multiple
2. **Descriptive names** - Explain what is being tested
3. **Arrange-Act-Assert** - Clear test structure
4. **Independent tests** - No shared state between tests
5. **Fast execution** - Unit tests should run in milliseconds
6. **Test edge cases** - NULL, NA, empty, boundary values
7. **Test error paths** - Not just happy paths

## Coverage Thresholds

```r
# In testthat.R or as a coverage check
covr::package_coverage(
  type = "all",
  line_coverage = 0.80,
  function_coverage = 0.80
)
```

**Tests are not optional. They enable confident refactoring and ensure code reliability.**
