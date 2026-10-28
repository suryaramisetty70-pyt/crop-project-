"""
Agricultural Input Validation and Schema Verification Module
"""

from typing import Dict, Any, Tuple, List

REQUIRED_FEATURES = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall"]

# Documented Agronomic Physical Constraints
BOUNDS = {
    "N": (0.0, 200.0, "kg/ha"),
    "P": (0.0, 200.0, "kg/ha"),
    "K": (0.0, 250.0, "kg/ha"),
    "temperature": (-10.0, 60.0, "°C"),
    "humidity": (0.0, 100.0, "%"),
    "ph": (0.0, 14.0, "pH"),
    "rainfall": (0.0, 600.0, "mm")
}

def validate_agricultural_inputs(inputs: Dict[str, Any]) -> Tuple[bool, List[str]]:
    """
    Validates a dictionary of agricultural soil and climate inputs.
    Returns (is_valid, list_of_error_messages).
    """
    errors = []
    for feat in REQUIRED_FEATURES:
        if feat not in inputs:
            errors.append(f"Missing required agricultural parameter: '{feat}'")
            continue
        val = inputs[feat]
        try:
            val_float = float(val)
        except (ValueError, TypeError):
            errors.append(f"Invalid non-numeric value for '{feat}': {val}")
            continue

        min_val, max_val, unit = BOUNDS[feat]
        if val_float < min_val or val_float > max_val:
            errors.append(
                f"Parameter '{feat}' value {val_float} is outside plausible agronomic range [{min_val}, {max_val}] {unit}."
            )

    return (len(errors) == 0, errors)

def validate_csv_schema(header_row: List[str]) -> Tuple[bool, List[str]]:
    """
    Validates CSV header columns.
    Must contain N, P, K, temperature, humidity, ph, rainfall and label.
    """
    normalized = [h.strip().lower() for h in header_row]
    errors = []
    for req in REQUIRED_FEATURES:
        if req.lower() not in normalized:
            errors.append(f"Required column '{req}' is missing from CSV header.")
    if "label" not in normalized and "crop" not in normalized:
        errors.append("Target crop column ('label' or 'crop') is missing from CSV header.")
    return (len(errors) == 0, errors)
