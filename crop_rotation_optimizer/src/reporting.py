"""
Reporting and CSV Export Utilities Module
"""

import csv
import io
from typing import List, Dict, Any

def export_predictions_to_csv(predictions: List[Dict[str, Any]]) -> str:
    """
    Exports a list of prediction records to a CSV formatted string.
    """
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "ID", "Timestamp", "Nitrogen", "Phosphorus", "Potassium",
        "Temperature", "Humidity", "pH", "Rainfall",
        "Previous_Crop", "Recommended_Crop", "Confidence_Pct"
    ])
    for p in predictions:
        writer.writerow([
            p.get("id", ""),
            p.get("timestamp", ""),
            p.get("n", p.get("nitrogen", "")),
            p.get("p", p.get("phosphorus", "")),
            p.get("k", p.get("potassium", "")),
            p.get("temperature", ""),
            p.get("humidity", ""),
            p.get("ph", ""),
            p.get("rainfall", ""),
            p.get("previous_crop", "None"),
            p.get("recommended_crop", p.get("predicted_crop", "")),
            p.get("confidence", "")
        ])
    return output.getvalue()

def export_rotation_plan_to_csv(plan: Dict[str, Any]) -> str:
    """
    Exports a crop rotation plan sequence to a CSV formatted string.
    """
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Season_Index", "Season_Name", "Recommended_Crop",
        "Crop_Family", "ANN_Suitability_Pct", "Rotation_Score_Pct",
        "Nitrogen_Impact", "Rationale"
    ])
    sequence = plan.get("sequence", [])
    for step in sequence:
        writer.writerow([
            step.get("season_number", step.get("seasonIndex", "")),
            step.get("season", step.get("seasonName", "")),
            step.get("crop", ""),
            step.get("family", ""),
            step.get("ann_suitability", step.get("annSuitability", "")),
            step.get("rotation_score", step.get("rotationScore", "")),
            step.get("nitrogen_impact", step.get("soilImpact", {}).get("nitrogenChange", "")),
            step.get("rationale", "")
        ])
    return output.getvalue()
