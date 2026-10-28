"""
Prediction Service Module
Handles input validation, ANN inference, and structured output formatting.
"""

from typing import Dict, Any, List, Tuple
from .validation import validate_agricultural_inputs
from .ann_model import ArtificialNeuralNetwork

class PredictionService:
    def __init__(self, model: ArtificialNeuralNetwork):
        self.model = model

    def predict_crop_suitability(self, inputs: Dict[str, Any], top_k: int = 5) -> Dict[str, Any]:
        """
        Validates inputs and returns top-K crop predictions with suitability probabilities.
        """
        is_valid, errors = validate_agricultural_inputs(inputs)
        if not is_valid:
            return {
                "success": False,
                "errors": errors,
                "top_candidates": []
            }

        numeric_inputs = {
            "N": float(inputs["N"]),
            "P": float(inputs["P"]),
            "K": float(inputs["K"]),
            "temperature": float(inputs["temperature"]),
            "humidity": float(inputs["humidity"]),
            "ph": float(inputs["ph"]),
            "rainfall": float(inputs["rainfall"])
        }

        ranked_crops = self.model.predict_single(numeric_inputs)
        top_candidates = []
        for crop, prob in ranked_crops[:top_k]:
            top_candidates.append({
                "crop": crop,
                "probability": round(prob, 4),
                "suitability_percentage": round(prob * 100.0, 2)
            })

        return {
            "success": True,
            "recommended_crop": top_candidates[0]["crop"] if top_candidates else "Unknown",
            "confidence": top_candidates[0]["suitability_percentage"] if top_candidates else 0.0,
            "top_candidates": top_candidates,
            "input_parameters": numeric_inputs
        }
