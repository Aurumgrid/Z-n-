# Load necessary libraries for testing
library(testthat)
library(pwr)

# Define the context for the tests
context("Power Calculation Script")

# Manually set the working directory to the project root for all tests.
# This ensures that relative paths in the script (e.g., to "results/")
# resolve correctly. `on.exit` guarantees the directory is reset.
old_wd <- getwd()
if (basename(old_wd) == "tests") {
  setwd("..")
}
on.exit(setwd(old_wd))

# --- Test Case 1: Check if the main script runs without errors ---
test_that("R script runs through without errors", {
  result <- try(source("R/calculate_power.R"), silent = TRUE)
  expect_false(inherits(result, "try-error"), "Script should not produce an error.")
})

# --- Test Case 2: Check if the output file is created ---
test_that("Output CSV file is created", {
  output_file <- "results/power_analysis_results.csv"
  if (file.exists(output_file)) {
    file.remove(output_file)
  }
  source("R/calculate_power.R")
  expect_true(file.exists(output_file), "The results CSV file should be created.")
})

# --- Test Case 3: Check the calculated sample size for known inputs ---
test_that("Calculated sample size is correct for standard parameters", {
  output_file <- "results/power_analysis_results.csv"
  # These are the default parameters from the script
  alpha <- 0.05
  power <- 0.80
  effect_size <- 0.5

  # Manually perform the calculation to get the expected result
  expected_result <- pwr.t.test(
    d = effect_size,
    sig.level = alpha,
    power = power,
    type = "two.sample",
    alternative = "two.sided"
  )
  expected_n <- ceiling(expected_result$n)

  # Run our script and read the output
  source("R/calculate_power.R")
  results_df <- read.csv(output_file)

  # Extract the calculated n from the data frame
  calculated_n <- results_df[results_df$parameter == "n_per_group", "value"]

  # Assert that the calculated value matches the expected value
  expect_equal(calculated_n, expected_n, info = "The calculated n per group should match the expected value.")
})

# --- Cleanup after tests ---
output_file <- "results/power_analysis_results.csv"
if (file.exists(output_file)) {
  file.remove(output_file)
}