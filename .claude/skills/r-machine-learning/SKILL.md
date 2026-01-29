---
name: R Machine Learning
description: Patterns for machine learning in R with gradient boosting, deep learning, ensembles, and cross-validation. Use when building ML models in R.
---

## Core Packages

```r
# Gradient Boosting
library(xgboost)
library(lightgbm)
library(catboost)

# Deep Learning
library(tabnet)
library(torch)

# Meta-Learners & Regularization
library(glmnet)

# Utilities
library(caret)    # Dummy encoding, grouped CV
library(pROC)     # AUC calculations
library(tidyverse)
```

## Data Preparation

### Prepare Features for Gradient Boosting

```r
prepare_xgb_data <- function(data, outcome_col,
                              exclude_cols = c("external_id", "month_number"),
                              dummy_model = NULL) {

  features <- data |>
    select(-all_of(c(exclude_cols, outcome_col)))

  outcome <- data[[outcome_col]]

  # Convert character to factor
  char_cols <- features |> select(where(is.character)) |> names()
  if (length(char_cols) > 0) {
    features <- features |>
      mutate(across(all_of(char_cols), as.factor))
  }

  # Convert factors to dummy variables
  factor_cols <- features |> select(where(is.factor)) |> names()
  if (length(factor_cols) > 0) {
    if (is.null(dummy_model)) {
      dummies <- dummyVars(~ ., data = features)
    } else {
      dummies <- dummy_model
    }
    features <- predict(dummies, newdata = features) |> as_tibble()
  } else {
    dummies <- NULL
  }

  # Ensure all columns are numeric
  features <- features |>
    mutate(across(everything(), as.numeric))

  x_matrix <- as.matrix(features)

  list(
    matrix = x_matrix,
    labels = outcome,
    feature_names = colnames(x_matrix),
    dummy_model = dummies
  )
}
```

### Feature Subsetting

```r
# Select top N features by importance
select_top_features <- function(importance_df, n = 200) {
  importance_df |>
    slice_max(Mean_Gain, n = n) |>
    pull(Feature)
}

# Apply feature subset
features <- features |>
  select(all_of(intersect(names(features), feature_subset)))
```

## Cross-Validation

### Grouped K-Fold CV (Respecting Subject Structure)

Always use grouped CV when observations are nested within subjects (e.g., longitudinal data).

```r
# Create grouped folds using caret
folds <- groupKFold(data$external_id, k = 10)

# Manual grouped stratified folds
create_grouped_folds <- function(external_id, outcome, n_folds = 10) {
  participant_outcomes <- tibble(
    external_id = external_id,
    outcome = outcome
  ) |>
    distinct(external_id, .keep_all = TRUE)

  participant_outcomes <- participant_outcomes |>
    mutate(
      fold = createFolds(outcome, k = n_folds, list = FALSE, returnTrain = FALSE)
    )

  tibble(external_id = external_id) |>
    left_join(participant_outcomes |> select(external_id, fold),
              by = "external_id") |>
    pull(fold)
}
```

### CV Training Loop

```r
cv_results <- list()

for (i in 1:10) {
  test_idx <- folds[[i]]
  train_idx <- setdiff(1:nrow(data), test_idx)

  # Prepare fold data (use same dummy_model for consistency)
  train_prep <- prepare_xgb_data(data[train_idx, ], outcome_col,
                                  dummy_model = dummy_model)
  test_prep <- prepare_xgb_data(data[test_idx, ], outcome_col,
                                 dummy_model = dummy_model)

  # Train and predict
  model <- train_model(train_prep)
  preds <- predict(model, test_prep$matrix)

  # Store results
  cv_results[[i]] <- tibble(
    fold = i,
    external_id = data[test_idx, ]$external_id,
    actual = test_prep$labels,
    predicted = preds
  )
}

all_predictions <- bind_rows(cv_results)
```

## Gradient Boosting Models

### XGBoost

```r
# Parameters
xgb_params <- list(
  objective = "binary:logistic",
  eval_metric = "auc",
  max_depth = 4,
  eta = 0.05,
  subsample = 0.8,
  colsample_bytree = 0.8,
  min_child_weight = 1,
  scale_pos_weight = 18.2  # For class imbalance: n_negative / n_positive
)

# Create DMatrix
dtrain <- xgb.DMatrix(data = train_prep$matrix, label = train_prep$labels)
dtest <- xgb.DMatrix(data = test_prep$matrix, label = test_prep$labels)

# Train
xgb_model <- xgb.train(
  params = xgb_params,
  data = dtrain,
  nrounds = 400,
  watchlist = list(train = dtrain, test = dtest),
  early_stopping_rounds = 10,
  verbose = 0
)

# Predict
xgb_preds <- predict(xgb_model, dtest)

# Feature importance
importance <- xgb.importance(model = xgb_model)
```

### LightGBM

```r
# Parameters (translated from XGBoost)
lgb_params <- list(
  objective = "binary",
  metric = "auc",
  learning_rate = 0.05,
  max_depth = 4,
  bagging_fraction = 0.8,
  feature_fraction = 0.8,
  min_child_weight = 1,
  num_leaves = 2^4 - 1,  # 2^max_depth - 1
  verbose = -1
)

# Create datasets
lgb_train <- lgb.Dataset(data = train_prep$matrix, label = train_prep$labels)
lgb_valid <- lgb.Dataset.create.valid(lgb_train,
                                       data = test_prep$matrix,
                                       label = test_prep$labels)

# Train
lgb_model <- lgb.train(
  params = lgb_params,
  data = lgb_train,
  nrounds = 400,
  valids = list(test = lgb_valid),
  verbose = -1
)

# Predict
lgb_preds <- predict(lgb_model, test_prep$matrix)
```

### CatBoost

```r
# Parameters (translated from XGBoost)
cb_params <- list(
  loss_function = "Logloss",
  eval_metric = "AUC",
  learning_rate = 0.05,
  depth = 4,
  subsample = 0.8,
  rsm = 0.8,  # random subspace method (colsample)
  min_child_samples = 20,
  verbose = 0,
  iterations = 400
)

# Create pools
cb_train <- catboost.load_pool(data = train_prep$matrix, label = train_prep$labels)
cb_test <- catboost.load_pool(data = test_prep$matrix, label = test_prep$labels)

# Train
cb_model <- catboost.train(
  learn_pool = cb_train,
  test_pool = cb_test,
  params = cb_params
)

# Predict
cb_preds <- catboost.predict(cb_model, cb_test, prediction_type = "Probability")
```

## Deep Learning with TabNet

TabNet is an attention-based neural network designed for tabular data.

```r
# Configure TabNet
tabnet_config <- tabnet_config(
  # Architecture
  decision_width = 8,
  attention_width = 8,
  num_steps = 3,

  # Regularization
  penalty = 0.001,  # Sparsity penalty

  # Network
  num_independent = 2,
  num_shared = 2,

  # Training
  momentum = 0.02,
  learn_rate = 0.05,
  epochs = 100,
  batch_size = 256,
  virtual_batch_size = 128,

  verbose = FALSE
)

# Train (outcome must be factor for classification)
train_outcome_factor <- factor(train_prep$outcome, levels = c(0, 1))

tabnet_model <- tabnet_fit(
  x = train_prep$features,  # data.frame, not matrix
  y = train_outcome_factor,
  config = tabnet_config
)

# Predict probabilities
tn_preds_raw <- predict(tabnet_model, test_prep$features, type = "prob")

# Extract probability for positive class
if (".pred_1" %in% names(tn_preds_raw)) {
  tn_preds <- tn_preds_raw$.pred_1
} else {
  tn_preds <- tn_preds_raw[[2]]
}
```

## Ensemble Methods

### Simple Averaging

```r
ensemble_pred <- (xgb_pred + lgb_pred + cb_pred) / 3
```

### Weighted Averaging

```r
# Weights proportional to individual AUC
total_auc <- xgb_auc + lgb_auc + cb_auc
xgb_weight <- xgb_auc / total_auc
lgb_weight <- lgb_auc / total_auc
cb_weight <- cb_auc / total_auc

ensemble_pred <- xgb_weight * xgb_pred + lgb_weight * lgb_pred + cb_weight * cb_pred
```

### Hill Climbing Ensemble Optimization

Find optimal ensemble weights through random search with greedy acceptance.

```r
hill_climbing <- function(oof_data, models = c("xgb", "lgb", "cb"),
                          n_iterations = 2000) {

  n_models <- length(models)

  # Start with equal weights
  best_weights <- rep(1/n_models, n_models)
  names(best_weights) <- models

  best_pred <- as.vector(as.matrix(oof_data[, models]) %*% best_weights)
  best_auc <- as.numeric(auc(roc(oof_data$actual, best_pred, quiet = TRUE)))

  for (iter in 1:n_iterations) {
    # Perturb weights randomly
    perturbation <- rnorm(n_models, mean = 0, sd = 0.05)
    new_weights <- best_weights + perturbation

    # Ensure weights are non-negative and sum to 1
    new_weights <- pmax(new_weights, 0)
    new_weights <- new_weights / sum(new_weights)

    # Calculate AUC with new weights
    new_pred <- as.vector(as.matrix(oof_data[, models]) %*% new_weights)
    new_auc <- as.numeric(auc(roc(oof_data$actual, new_pred, quiet = TRUE)))

    # Accept if better (greedy)
    if (new_auc > best_auc) {
      best_weights <- new_weights
      best_auc <- new_auc
    }
  }

  list(best_weights = best_weights, best_auc = best_auc)
}
```

### Ridge Meta-Learner (Stacking)

Use Ridge regression to learn optimal combination of base model predictions.

```r
# Prepare OOF predictions as features
X_meta <- as.matrix(oof_data[, c("xgb", "lgb", "cb")])
y_meta <- oof_data$actual

# Cross-validation to find optimal lambda
ridge_cv <- cv.glmnet(
  x = X_meta,
  y = y_meta,
  family = "binomial",
  alpha = 0,              # Ridge (alpha=0), Lasso (alpha=1)
  type.measure = "auc",
  nfolds = 10
)

# Train final model
ridge_model <- glmnet(
  x = X_meta,
  y = y_meta,
  family = "binomial",
  alpha = 0,
  lambda = ridge_cv$lambda.min
)

# Predict
ridge_pred <- predict(ridge_model, X_meta, s = ridge_cv$lambda.min, type = "response")
```

## Evaluation Metrics

### Calculate All Classification Metrics

```r
calculate_metrics <- function(actual, predicted_prob, threshold = 0.5) {
  pred_class <- as.integer(predicted_prob > threshold)

  # AUC-ROC
  roc_obj <- roc(actual, predicted_prob, quiet = TRUE)
  auc_val <- as.numeric(auc(roc_obj))

  # Log loss
  eps <- 1e-15
  pred_clipped <- pmax(pmin(predicted_prob, 1 - eps), eps)
  logloss <- -mean(actual * log(pred_clipped) +
                   (1 - actual) * log(1 - pred_clipped))

  # Confusion matrix metrics
  confusion <- table(Predicted = pred_class, Actual = actual)

  if (all(dim(confusion) == c(2, 2))) {
    tp <- confusion[2, 2]
    fp <- confusion[2, 1]
    tn <- confusion[1, 1]
    fn <- confusion[1, 2]

    precision <- tp / (tp + fp)
    recall <- tp / (tp + fn)
    f1 <- 2 * (precision * recall) / (precision + recall)
    accuracy <- (tp + tn) / sum(confusion)
  } else {
    precision <- recall <- f1 <- accuracy <- NA
  }

  tibble(
    auc = auc_val,
    logloss = logloss,
    accuracy = accuracy,
    precision = precision,
    recall = recall,
    f1 = f1
  )
}
```

### Aggregate Feature Importance Across Folds

```r
aggregate_importance <- function(cv_results) {
  cv_results |>
    map_dfr(\(fold) fold$feature_importance, .id = "fold") |>
    group_by(Feature) |>
    summarise(
      Mean_Gain = mean(Gain),
      Mean_Cover = mean(Cover),
      Mean_Frequency = mean(Frequency),
      .groups = "drop"
    ) |>
    arrange(desc(Mean_Gain))
}
```

## Hyperparameter Tuning

### Manual Grid Search

```r
param_grid <- list(
  config1 = list(max_depth = 4, eta = 0.05, subsample = 0.8),
  config2 = list(max_depth = 6, eta = 0.1, subsample = 0.8),
  config3 = list(max_depth = 3, eta = 0.1, subsample = 0.7)
)

results <- list()

for (config_name in names(param_grid)) {
  params <- c(
    list(objective = "binary:logistic", eval_metric = "auc"),
    param_grid[[config_name]]
  )

  results[[config_name]] <- train_with_cv(data, params)
}

# Compare
comparison <- tibble(
  Config = names(results),
  AUC = map_dbl(results, "mean_auc")
) |>
  arrange(desc(AUC))
```

## Feature Engineering for Longitudinal Data

```r
data_engineered <- data |>
  group_by(external_id) |>
  arrange(month_number) |>
  mutate(
    # Lagged features
    phq_total_lag1 = lag(phq_total, 1),
    phq_total_lag2 = lag(phq_total, 2),

    # Changes
    phq_change = phq_total - lag(phq_total, 1),

    # Rolling statistics
    phq_roll_mean = (phq_total + lag(phq_total, 1)) / 2,
    phq_roll_max = pmax(phq_total, lag(phq_total, 1)),

    # Time in study
    months_in_study = month_number - min(month_number),

    # Interactions
    phq_pcl_interaction = phq_total * pcl_total,
    phq_age_interaction = phq_total * age_masked
  ) |>
  ungroup()
```

## Handling Class Imbalance

```r
# Calculate imbalance ratio
n_positive <- sum(outcome == 1)
n_negative <- sum(outcome == 0)
scale_pos_weight <- n_negative / n_positive

# Use in XGBoost params
xgb_params <- list(
  objective = "binary:logistic",
  scale_pos_weight = scale_pos_weight,
  ...
)
```

## Saving and Loading Models

```r
# Save all results
results <- list(
  models = list(
    xgboost = xgb_models,
    lightgbm = lgb_models,
    catboost = cb_models
  ),
  predictions = all_predictions,
  metrics = metrics,
  feature_importance = importance,
  config = list(
    top_features = top_200_features,
    params = best_params
  )
)

saveRDS(results, "outputs/model_results.rds")

# Load
results <- readRDS("outputs/model_results.rds")
```

## Anti-Patterns to Avoid

```r
# WRONG: Not respecting subject grouping in CV
folds <- createFolds(outcome, k = 10)  # Data leakage!

# CORRECT: Group by subject
folds <- groupKFold(data$external_id, k = 10)

# WRONG: Using different dummy encoding for train/test
train_prep <- prepare_xgb_data(train_data, ...)
test_prep <- prepare_xgb_data(test_data, ...)  # Different levels!

# CORRECT: Store and reuse dummy model
train_prep <- prepare_xgb_data(train_data, ...)
test_prep <- prepare_xgb_data(test_data, ..., dummy_model = train_prep$dummy_model)

# WRONG: Calculating AUC per fold then averaging
mean(fold_aucs)  # Can be misleading

# CORRECT: Calculate overall AUC from all predictions
overall_auc <- auc(roc(all_predictions$actual, all_predictions$predicted))
```
