# Load necessary libraries
# Ensure 'pwr' is installed by running: install.packages("pwr")
library(pwr)

# --- Parameters for Power Calculation ---
# This script calculates the statistical power for a two-sample t-test,
# which is useful for planning experiments to detect a specific effect size.

# Significance level (alpha): The probability of a Type I error (false positive).
# Typically set to 0.05.
alpha <- 0.05

# Desired power (1 - beta): The probability of detecting a true effect (avoiding a Type II error).
# A common target is 80% or 90%.
power <- 0.80

# Effect size (Cohen's d): The standardized difference between the two means.
# d = (mean_1 - mean_2) / pooled_sd
# Small effect: d = 0.2
# Medium effect: d = 0.5
# Large effect: d = 0.8
effect_size <- 0.5 # Assuming a medium effect size

# --- Perform Power Calculation ---
# We want to find the required sample size (n) per group.
power_analysis <- pwr.t.test(
  d = effect_size,
  sig.level = alpha,
  power = power,
  type = "two.sample",      # Two-sample t-test
  alternative = "two.sided" # Two-tailed test
)

# --- Output the Results ---
cat("--- T-Test Power Analysis ---\n")
cat("This analysis determines the sample size needed per group.\n\n")
cat("Parameters:\n")
cat(paste("  - Significance Level (alpha):", alpha, "\n"))
cat(paste("  - Desired Power:", power, "\n"))
cat(paste("  - Assumed Effect Size (Cohen's d):", effect_size, "\n\n"))

cat("Results:\n")
# The result 'n' is the sample size required for each group.
cat(paste("  - Required sample size per group (n):", ceiling(power_analysis$n), "\n"))
cat(paste("  - Total required sample size:", 2 * ceiling(power_analysis$n), "\n"))
cat("\n")

# Save the result to a file for programmatic access
output_dir <- "results"
if (!dir.exists(output_dir)) {
  dir.create(output_dir)
}
result_df <- data.frame(
  parameter = c("alpha", "power", "effect_size", "n_per_group", "n_total"),
  value = c(alpha, power, effect_size, ceiling(power_analysis$n), 2 * ceiling(power_analysis$n))
)
write.csv(result_df, file.path(output_dir, "power_analysis_results.csv"), row.names = FALSE)

cat(paste("Results saved to '", file.path(output_dir, "power_analysis_results.csv"), "'\n", sep=""))