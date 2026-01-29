# Security Guidelines for R Projects

## Mandatory Security Checks

Before committing any code, verify:

1. **No hardcoded secrets** - API keys, passwords, tokens, database credentials
2. **Sensitive data protection** - PII, health data, financial data properly anonymized
3. **Safe file operations** - No arbitrary path traversal, validate file inputs
4. **Database security** - Parameterized queries, no SQL injection vulnerabilities
5. **Environment variables** - Use for all configuration secrets
6. **Data output safety** - No accidental exposure of sensitive data in logs or outputs

## Secret Management

```r
# WRONG - Hardcoded credentials
api_key <- "sk-abc123..."
db_password <- "mysecretpassword"

# CORRECT - Environment variables
api_key <- Sys.getenv("API_KEY")
if (api_key == "") {
  stop("API_KEY environment variable not set")
}

# CORRECT - Using .Renviron (add to .gitignore!)
# In .Renviron:
# API_KEY=sk-abc123...
```

## Data Security Patterns

```r
# WRONG - Logging sensitive data
message("Processing user: ", user_email)

# CORRECT - Anonymize or omit
message("Processing user ID: ", user_id)

# WRONG - Saving data with PII
write_csv(data, "output.csv")  # May contain sensitive columns

# CORRECT - Select only needed columns
data |>
  select(-email, -ssn, -dob) |>
  write_csv("output.csv")
```

## File Security

```r
# WRONG - Accepting arbitrary paths
read_csv(user_provided_path)

# CORRECT - Validate and constrain paths
validate_path <- function(path, allowed_dir = "data/") {
  # Normalize and check path is within allowed directory
  normalized <- normalizePath(path, mustWork = FALSE)
  if (!startsWith(normalized, normalizePath(allowed_dir))) {
    stop("Path not allowed: ", path)
  }
  normalized
}
```

## Files to Never Commit

Add to `.gitignore`:

```
# Credentials
.Renviron
.Rprofile  # if contains secrets
credentials.json
*.pem
*.key

# Data files that may contain PII
data/raw/
*.rds  # if contains sensitive data

# Config with secrets
config.yml
secrets.yml
```

## Response Protocol

When security issues are discovered:

1. **STOP** - Halt current work immediately
2. **ASSESS** - Determine scope and severity
3. **FIX** - Address critical vulnerabilities first
4. **ROTATE** - Update any compromised credentials
5. **REVIEW** - Check codebase for similar issues

## R-Specific Security Considerations

- Never use `eval(parse(text = user_input))` with untrusted input
- Validate inputs to Shiny apps before processing
- Use parameterized queries with DBI (`dbGetQuery` with `params`)
- Be cautious with `source()` on untrusted files
- Sanitize user inputs in Shiny/Plumber applications

**Security vulnerabilities are blocking issues. No code with security vulnerabilities should be committed.**
