# Gridwalker v2.1 Analysis Toolkit

[![CI](https://github.com/gridwalker/v2.1-analysis/actions/workflows/ci.yml/badge.svg)](https://github.com/gridwalker/v2.1-analysis/actions/workflows/ci.yml)

This repository contains a collection of Python and R scripts for designing and analyzing experiments for the Gridwalker v2.1 protocol. It includes tools for generating stimulus waveforms, randomizing plate assignments, performing power calculations, and processing simulated instrument data.

## Project Structure

The repository is organized as follows:

-   `.github/workflows/`: Contains the GitHub Actions CI workflow for automated testing.
-   `R/`: Contains R scripts for statistical analysis.
    -   `calculate_power.R`: Performs a power analysis to determine the required sample size.
    -   `DESCRIPTION`: Lists R package dependencies.
-   `src/`: Contains the core Python source code.
    -   `generate_waveform.py`: Generates the complex, non-repeating waveform.
    -   `assign_plates.py`: Creates a balanced Latin-square-based plate assignment.
    -   `estimate_g2.py`: Estimates the g²(τ) temporal correlation from photon arrival data.
    -   `match_rms.py`: Simulates matching a target magnetometer RMS value and generates a QC plot.
    -   `nonlinear_king_plot.py`: Implements and demonstrates a non-linear King plot analysis.
-   `results/`: The default output directory for generated files (e.g., `.csv`, `.json`, `.png`). This directory is created automatically.
-   `tests/`: Contains unit and integration tests.
    -   `test_python_scripts.py`: `pytest` tests for the Python scripts.
    -   `test_r_power_calc.R`: `testthat` tests for the R script.
    -   `test_nonlinear_king_plot.py`: `pytest` tests for the non-linear King plot analysis.
-   `requirements.txt`: A list of Python package dependencies.
-   `README.md`: This file.

## Setup and Installation

### 1. Clone the Repository

```bash
git clone <repository_url>
cd <repository_directory>
```

### 2. Python Dependencies

Ensure you have Python 3.7+ installed. Then, install the required packages using pip:

```bash
pip install -r requirements.txt
```

### 3. R Dependencies

Ensure you have R installed. Open an R session and install the required packages:

```R
install.packages(c("pwr", "testthat"))
```

## How to Run the Scripts

All scripts are designed to be run from the root of the repository. Outputs are saved to the `results/` directory by default.

### Python Scripts

```bash
# Generate the stimulus waveform and its metadata
python src/generate_waveform.py

# Create the plate assignment schedule
python src/assign_plates.py

# Run a simulation of g2(τ) estimation
python src/estimate_g2.py

# Simulate magnetometer RMS matching and create a QC plot
python src/match_rms.py

# Run the non-linear King plot analysis demonstration
python src/nonlinear_king_plot.py
```

### R Script

```bash
# Calculate the required sample size via power analysis
Rscript R/calculate_power.R
```

## How to Run Tests

The test suite verifies the core logic of all scripts.

### Python Tests

Run the `pytest` suite from the root directory:

```bash
pytest
```

### R Tests

Run the `testthat` suite using an R command:

```bash
Rscript -e "testthat::test_dir('tests/')"
```

The full test suite is run automatically on every push to the repository via GitHub Actions.