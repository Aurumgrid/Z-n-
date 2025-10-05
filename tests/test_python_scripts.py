import pytest
import numpy as np
import os
import json
from src.generate_waveform import generate_waveform
from src.assign_plates import assign_plates
from src.estimate_g2 import estimate_g2
from src.match_rms import match_rms

# --- Constants for testing ---
SAMPLING_RATE = 1000  # Use a lower rate for faster tests
DURATION = 0.1

@pytest.fixture(scope="session", autouse=True)
def setup_teardown():
    """Create results directory before tests and clean up after."""
    if not os.path.exists("results"):
        os.makedirs("results")
    yield
    # Teardown can be added here if needed, e.g., deleting files.

# --- Tests for generate_waveform.py ---

def test_generate_waveform_output_properties():
    """Test the shape and RMS of the generated waveform."""
    target_rms = 0.5
    waveform, meta = generate_waveform(
        duration=DURATION,
        sampling_rate=SAMPLING_RATE,
        target_rms=target_rms
    )

    assert waveform.shape == (int(DURATION * SAMPLING_RATE),)
    assert np.isclose(meta["final_rms"], target_rms, atol=1e-9)
    assert "calibration_factor" in meta

# --- Tests for assign_plates.py ---

def test_assign_plates_balance_and_structure():
    """Test if plate assignments are balanced and correctly structured."""
    num_plates = 12
    arms = ["A", "B", "C"]
    assignments = assign_plates(num_plates=num_plates, arms=arms, seed=42)

    assert len(assignments) == num_plates
    assert all("plate_id" in d and "arm" in d for d in assignments)

    # Check for balance
    arm_counts = np.unique([a["arm"] for a in assignments], return_counts=True)[1]
    assert np.all(arm_counts == num_plates / len(arms))

def test_assign_plates_reproducibility():
    """Test if the same seed produces the same assignment."""
    assign1 = assign_plates(seed=123)
    assign2 = assign_plates(seed=123)
    assert json.dumps(assign1) == json.dumps(assign2)

# --- Tests for estimate_g2.py ---

def test_estimate_g2_no_photons():
    """Test g2 estimation with no input photons."""
    tau, g2 = estimate_g2(np.array([]), duration=1.0)
    assert tau is None
    assert g2 is None

def test_estimate_g2_zero_division_guard():
    """Test the guard against division by zero if duration is zero."""
    photons = np.array([0.1, 0.2, 0.3])
    tau, g2 = estimate_g2(photons, duration=0)
    assert tau is None
    assert g2 is None

def test_estimate_g2_output_shape():
    """Test the output shape of the g2 estimation."""
    photons = np.random.rand(100) * 0.01
    max_tau = 1e-3
    bin_width = 1e-4
    tau, g2 = estimate_g2(photons, max_tau=max_tau, bin_width=bin_width, duration=0.01)

    expected_bins = int(max_tau / bin_width)
    assert tau.shape == (expected_bins,)
    assert g2.shape == (expected_bins,)

# --- Tests for match_rms.py ---

def test_match_rms_output_shape():
    """Test the output shape of the RMS matching simulation."""
    duration = 50
    time, b_rms = match_rms(target_rms=0.1, duration=duration, plot_qc=False)

    assert time.shape == (duration,)
    assert b_rms.shape == (duration,)

def test_match_rms_qc_plot_generation():
    """Test if the QC plot is created."""
    plot_path = "results/magnetometer_rms_qc.png"
    if os.path.exists(plot_path):
        os.remove(plot_path)

    match_rms(target_rms=0.1, plot_qc=True)

    assert os.path.exists(plot_path)
    # Clean up the created file
    os.remove(plot_path)