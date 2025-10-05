import numpy as np
import json
from typing import List, Dict, Any

def assign_plates(
    num_plates: int = 12,
    arms: List[str] = None,
    seed: int = 42
) -> List[Dict[str, Any]]:
    """
    Assigns experimental arms to plates using a Latin-square-like design.

    This function creates a balanced assignment of treatments (arms) to
    experimental units (plates) to minimize confounding from spatial or
    temporal effects. It tiles a base Latin square and then slices it to
    fit the number of plates.

    Args:
        num_plates: The total number of plates to assign.
        arms: A list of treatment arm names. Defaults to ["A", "B", "C"].
        seed: A random seed for reproducibility.

    Returns:
        A list of dictionaries, where each dictionary represents a plate
        and its assigned arm and ID.
    """
    if arms is None:
        arms = ["control", "treatment_1", "treatment_2"]

    rng = np.random.default_rng(seed)

    # Create a base Latin square (e.g., 3x3 for 3 arms)
    n = len(arms)
    base_square = np.array([ (np.arange(n) + i) % n for i in range(n) ])

    # Tile the square to be large enough for all plates
    repeats = int(np.ceil(num_plates / n))
    tiled_square = np.tile(base_square, (repeats, 1))

    # Take a slice to match the number of plates
    flat_indices = tiled_square.flatten()[:num_plates]

    # Create the assignment list
    assignments = []
    for i in range(num_plates):
        arm_index = flat_indices[i]
        assignments.append({
            "plate_id": f"plate_{i+1:03d}",
            "arm": arms[arm_index]
        })

    # Sanity check: verify balance
    assigned_arms = [a['arm'] for a in assignments]
    counts = {arm: assigned_arms.count(arm) for arm in arms}
    print("Arm balance check:", counts)

    if not all(c == num_plates // n for c in counts.values()):
        print("Warning: Arms are not perfectly balanced.")

    return assignments

if __name__ == "__main__":
    NUM_PLATES = 12
    TREATMENT_ARMS = ["Arm_X", "Arm_Y", "Arm_Z"]

    # Generate the plate assignments
    plate_assignments = assign_plates(
        num_plates=NUM_PLATES,
        arms=TREATMENT_ARMS,
        seed=123
    )

    # Save the assignment to a JSON file
    output_dir = "results"
    with open(f"{output_dir}/plate_assignment.json", "w") as f:
        json.dump(plate_assignments, f, indent=4)

    print(f"Plate assignments saved to '{output_dir}/plate_assignment.json'")