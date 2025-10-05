import numpy as np
import json
from typing import Dict, Tuple, Any

def generate_waveform(
    duration: float = 1.0,
    sampling_rate: int = 44100,
    frequency: float = 440.0,
    phi: float = 1.61803398875,
    target_rms: float = 0.5,
) -> Tuple[np.ndarray, Dict[str, Any]]:
    """
    Generates a phase-modulated waveform with a specific RMS level.

    The phase of a sine wave is advanced based on the golden ratio (phi)
    to create a complex, non-repeating pattern. The final signal is scaled
    to a target Root Mean Square (RMS) value.

    Args:
        duration: The total duration of the waveform in seconds.
        sampling_rate: The number of samples per second (Hz).
        frequency: The base frequency of the sine wave in Hz.
        phi: The multiplier for the phase step, creating non-periodic behavior.
        target_rms: The desired RMS amplitude of the output signal.

    Returns:
        A tuple containing:
        - A numpy array of the generated waveform.
        - A dictionary with metadata, including the final calibration factor.
    """
    num_samples = int(duration * sampling_rate)
    time = np.linspace(0, duration, num_samples, endpoint=False)

    # Generate phase steps; using a large prime ensures a long repeat period
    phase_step = 2 * np.pi * phi / 13
    phase = np.cumsum(np.ones(num_samples) * phase_step)

    # Create the core signal
    signal = np.sin(2 * np.pi * frequency * time + phase)

    # Calculate the initial RMS and the required scaling factor
    initial_rms = np.sqrt(np.mean(signal**2))
    scale_factor = target_rms / initial_rms if initial_rms > 0 else 0

    # Apply scaling
    calibrated_signal = signal * scale_factor

    # Store metadata
    metadata = {
        "duration_s": duration,
        "sampling_rate_hz": sampling_rate,
        "base_frequency_hz": frequency,
        "phi": phi,
        "target_rms": target_rms,
        "initial_rms": initial_rms,
        "calibration_factor": scale_factor,
        "final_rms": np.sqrt(np.mean(calibrated_signal**2)),
    }

    return calibrated_signal, metadata

if __name__ == "__main__":
    # Parameters
    WAVEFORM_DURATION = 5.0  # seconds
    SAMPLING_RATE = 48000  # Hz
    TARGET_FREQUENCY = 1000.0  # Hz
    TARGET_RMS_T = 0.1  # Target amplitude for magnetometer

    # Generate the waveform
    waveform, meta = generate_waveform(
        duration=WAVEFORM_DURATION,
        sampling_rate=SAMPLING_RATE,
        frequency=TARGET_FREQUENCY,
        target_rms=TARGET_RMS_T,
    )

    # Save the results
    output_dir = "results"
    np.savetxt(f"{output_dir}/waveform.csv", waveform, delimiter=",")
    with open(f"{output_dir}/waveform_metadata.json", "w") as f:
        json.dump(meta, f, indent=4)

    print("Waveform generated and saved to 'results/waveform.csv'")
    print("Metadata saved to 'results/waveform_metadata.json'")