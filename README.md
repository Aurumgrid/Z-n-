# AO-Powered Arweave Storage with CLI

This project provides a complete, decentralized file storage solution built on Arweave and AO. It combines a simple AO smart contract for on-chain metadata management with a user-friendly command-line interface (CLI) to make permanent file storage easy and efficient.

This implementation represents a "Level B" integration, where the complexities of the upload and registration process are abstracted into a single, simple command.

## Table of Contents

1.  [**Overview**](#1-overview)
2.  [**How It Works**](#2-how-it-works)
    -   The AO Smart Contract (`arweave_storage.lua`)
    -   The Command-Line Interface (`cli.js`)
3.  [**Prerequisites**](#3-prerequisites)
4.  [**Setup and Installation**](#4-setup-and-installation)
5.  [**Deployment and Usage**](#5-deployment-and-usage)
    -   Step 1: Deploy the AO Contract
    -   Step 2: Use the CLI to Upload and Register Files
6.  [**Further Reading**](#6-further-reading)

---

### 1. Overview

This project demonstrates a powerful pattern for decentralized applications: storing large data blobs off-chain while managing their metadata and ownership on-chain.

-   **Files** are uploaded directly to the **Arweave permaweb**, ensuring they are stored permanently and immutably.
-   An **AO smart contract** (`arweave_storage.lua`) acts as a registry, storing a reference (the Arweave Transaction ID) and metadata for each file.
-   A **Node.js CLI** (`cli.js`) provides a seamless user experience, handling the two-step process of uploading to Arweave and registering with AO in a single command.

### 2. How It Works

#### The AO Smart Contract (`arweave_storage.lua`)

This Lua script is the on-chain backbone of the application. It is a simple yet robust contract that exposes three main actions:

-   `Upload`: Allows a user to register an Arweave Transaction ID (TXID), associating it with a file name, size, and their wallet address (as the owner).
-   `List`: Allows a user to retrieve a list of all the file records they own.
-   `Delete`: Allows a user to remove a file record. This action is protected; only the original owner can delete their records.

#### The Command-Line Interface (`cli.js`)

The CLI is the "Level B" integration that simplifies the user workflow. Instead of performing multiple manual steps, the user can execute a single command. The script handles:

1.  Reading the user's local file.
2.  Connecting to their Arweave wallet.
3.  Uploading the file to the Arweave network.
4.  Capturing the resulting Transaction ID (TXID).
5.  Executing an `aos` command to call the `Upload` action on the AO smart contract, registering the file.

### 3. Prerequisites

-   **Node.js and npm:** Required to run the CLI tool and install dependencies.
-   **An Arweave Wallet:** A JSON keyfile with a funded AR balance. See the [Arweave Quick-Start Guide](./arweave-quick-start.md) to create one.
-   **`aos` CLI:** The command-line tool for AO. Ensure it is installed and accessible in your system's PATH.

### 4. Setup and Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install Node.js dependencies:**
    ```bash
    npm install
    ```

### 5. Deployment and Usage

#### Step 1: Deploy the AO Contract

First, you need to deploy the `arweave_storage.lua` script to the AO network.

```bash
aos arweave_storage.lua --wallet /path/to/your/arweave-keyfile.json
```

This command will return a **Process ID**. Copy this ID, as you will need it to interact with your contract.

`Process: <YOUR_PROCESS_ID>`

#### Step 2: Use the CLI to Upload and Register Files

Now you can use the `cli.js` tool to upload a file. The command requires three arguments: the path to your local file, your newly created AO Process ID, and the path to your Arweave wallet file.

**Command Syntax:**

```bash
node cli.js <path-to-file> <your-ao-process-id> <path-to-your-wallet.json>
```

**Example:**

```bash
node cli.js ./my-research.pdf <YOUR_PROCESS_ID> ~/.secrets/arweave-key.json
```

The script will provide real-time feedback, showing the upload progress and the final confirmation from the AO contract.

### 6. Further Reading

-   [**Arweave Quick-Start Guide**](./arweave-quick-start.md): For more details on Arweave itself.
-   [**AO Cookbook**](https://ao-cookbook.g8way.io/): For more advanced AO development concepts.
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
-   `results/`: The default output directory for generated files (e.g., `.csv`, `.json`, `.png`). This directory is created automatically.
-   `tests/`: Contains unit and integration tests.
    -   `test_python_scripts.py`: `pytest` tests for the Python scripts.
    -   `test_r_power_calc.R`: `testthat` tests for the R script.
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
