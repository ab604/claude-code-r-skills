---
name: Bayesian inference in R
description: Preferences for Bayesian inference in R
---

## Directed Acyclic Graphs

Prior to performing Bayesian Inference we first need to create DAGs with dagitty, ggdag

## Bayesian Regression Modelling

Bayeisan inference in R should use brms with these preferences including cmdstanr as the backend.

```{r}
options(mc.cores = 4)

# BRMs preferences
sample_prior = "yes",
 # MCMC settings
  chains = 4,
  cores = 4,
  iter = 4000,
  warmup = 1000,
  control = list(
    adapt_delta = 0.95,
    max_treedepth = 15
  ),
  seed = 1996,
backend = "cmdstanr"
```

priors should be stored in a separate script called by the brms.

## Other packages to use

+ tidybayes: For extracting and manipulating posterior draws
+ marginaleffects: For calculating marginal effects
+ bayesplot: Additional plotting options for Bayesian models
