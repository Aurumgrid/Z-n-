import numpy as np
import json
from typing import Tuple, Optional

def estimate_g2(
    photon_times: np.ndarray,
    bin_width: float = 1e-9,
    max_tau: float = 1e-6,
    duration: float = 1.0,
) -> Tuple[Optional[np.ndarray], Optional[np.ndarray]]:
    """
    Estimates the second-order temporal correlation function, g^(2)(τ).

    This function calculates g^(2)(τ) from a list of photon arrival times.
    It computes a histogram of time differences (τ) between all pairs of
    photons and normalizes it to estimate the correlation.

    Args:
        photon_times: A 1D numpy array of photon arrival times in seconds.
        bin_width: The width of the time bins for the histogram (in seconds).
        max_tau: The maximum time delay (τ) to consider (in seconds).
        duration: The total duration of the measurement period (in seconds).

    Returns:
        A tuple containing:
        - A numpy array of the time delays (τ values, bin centers).
        - A numpy array of the corresponding g^(2)(τ) values.
        Returns (None, None) if no photons are provided.
    """
    num_photons = len(photon_times)

    # Guard against division-by-zero if no photons are detected
    if num_photons < 2 or duration <= 0:
        return None, None

    # Mean photon count rate
    mu = num_photons / duration
    if mu == 0:
        return None, None # No photons, g2 is undefined

    # Calculate time differences for all pairs
    # This is computationally intensive (O(N^2)) but fine for typical data
    diffs = np.array([
        t_j - t_i
        for i, t_i in enumerate(photon_times)
        for t_j in photon_times[i+1:]
    ])

    # Create histogram of time differences
    num_bins = int(max_tau / bin_width)
    bins = np.linspace(0, max_tau, num_bins + 1)
    coincidences, _ = np.histogram(diffs, bins=bins)

    # Normalization factor for g^(2)(τ)
    # N(N-1)/2 is total pairs, T is duration, dt is bin width
    # Normalization = (Total Pairs * Bin Width) / Duration
    # Simplified to: mu * (N-1) * dt / 2
    # The factor of 2 cancels as we only look at t_j > t_i
    normalization_factor = mu * (num_photons - 1) * bin_width

    if normalization_factor == 0:
        return None, None

    g2_values = coincidences / normalization_factor

    # Get the center of each bin for plotting
    tau_values = (bins[:-1] + bins[1:]) / 2

    return tau_values, g2_values

if __name__ == "__main__":
    # Simulate some photon arrival data (e.g., from a single-photon source)
    # A real source would have g2(0) close to 0
    np.random.seed(42)
    MEASUREMENT_DURATION = 0.1  # seconds
    PHOTON_RATE = 5e6  # photons/sec

    # Generate random arrival times
    num_events = int(MEASUREMENT_DURATION * PHOTON_RATE)
    simulated_photons = np.sort(np.random.rand(num_events) * MEASUREMENT_DURATION)

    # Estimate g2(tau)
    tau, g2 = estimate_g2(
        simulated_photons,
        bin_width=1e-9,
        max_tau=50e-9,
        duration=MEASUREMENT_DURATION
    )

    # Save the results
    if tau is not None:
        output_dir = "results"
        result_data = {"tau_s": tau.tolist(), "g2": g2.tolist()}
        with open(f"{output_dir}/g2_estimate.json", "w") as f:
            json.dump(result_data, f, indent=4)
        print(f"g^(2)(τ) estimate saved to '{output_dir}/g2_estimate.json'")
    else:
        print("Could not estimate g^(2)(τ) (not enough photons).")