import numpy as np
import matplotlib.pyplot as plt
from typing import Tuple

def match_rms(
    target_rms: float,
    noise_level: float = 0.01,
    duration: int = 100,
    plot_qc: bool = True
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Simulates matching a target RMS value for a noisy signal.

    This function generates a simulated time series of RMS values that
    converge toward a target, mimicking a feedback loop adjusting a physical
    parameter (e.g., magnetic field strength).

    Args:
        target_rms: The target RMS value to achieve.
        noise_level: The standard deviation of the measurement noise.
        duration: The number of time steps for the simulation.
        plot_qc: If True, generates and saves a QC plot.

    Returns:
        A tuple containing:
        - A numpy array of the time steps.
        - A numpy array of the measured RMS values over time.
    """
    time = np.arange(duration)

    # Simulate a gradual approach to the target RMS with some noise
    # This models a simple proportional controller response
    initial_error = target_rms * 0.5
    convergence_rate = 0.05

    # Exponential decay towards the target
    b_rms = target_rms - initial_error * np.exp(-convergence_rate * time)

    # Add measurement noise
    noise = np.random.normal(0, noise_level, size=duration)
    b_rms_noisy = b_rms + noise

    if plot_qc:
        plt.figure(figsize=(10, 6))
        plt.plot(time, b_rms_noisy, label="Measured RMS (Simulated)", alpha=0.8)
        plt.axhline(y=target_rms, color='r', linestyle='--', label=f"Target RMS = {target_rms}")
        plt.title("Magnetometer RMS Matching QC Plot")
        plt.xlabel("Time (arbitrary units)")
        plt.ylabel("Measured B_rms")
        plt.legend()
        plt.grid(True)

        # Save the plot
        output_dir = "results"
        plot_path = f"{output_dir}/magnetometer_rms_qc.png"
        plt.savefig(plot_path)
        print(f"QC plot saved to '{plot_path}'")
        plt.close()

    return time, b_rms_noisy

if __name__ == "__main__":
    TARGET_B_RMS = 0.1  # Example target RMS for the B field
    NOISE = 0.005       # Std dev of measurement noise

    # Run the simulation
    match_rms(target_rms=TARGET_B_RMS, noise_level=NOISE, plot_qc=True)

    print("RMS matching simulation complete.")