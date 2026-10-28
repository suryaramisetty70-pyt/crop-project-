import unittest
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from src.ann_model import ArtificialNeuralNetwork
from src.prediction import PredictionService

class TestPrediction(unittest.TestCase):
    def setUp(self):
        self.ann = ArtificialNeuralNetwork(hidden_layers=[32, 16])
        dummy_train = [
            {"N": 90, "P": 42, "K": 43, "temperature": 21.0, "humidity": 82.0, "ph": 6.5, "rainfall": 202.0, "label": "rice"},
            {"N": 85, "P": 58, "K": 41, "temperature": 22.0, "humidity": 80.0, "ph": 7.0, "rainfall": 226.0, "label": "rice"},
            {"N": 20, "P": 60, "K": 80, "temperature": 18.0, "humidity": 15.0, "ph": 7.0, "rainfall": 70.0, "label": "chickpea"},
            {"N": 25, "P": 65, "K": 78, "temperature": 19.0, "humidity": 16.0, "ph": 7.2, "rainfall": 75.0, "label": "chickpea"},
            {"N": 70, "P": 40, "K": 20, "temperature": 23.0, "humidity": 65.0, "ph": 6.0, "rainfall": 90.0, "label": "maize"},
            {"N": 75, "P": 45, "K": 22, "temperature": 24.0, "humidity": 68.0, "ph": 6.2, "rainfall": 95.0, "label": "maize"}
        ]
        self.ann.train(dummy_train, dummy_train, epochs=5, learning_rate=0.01)
        self.service = PredictionService(self.ann)

    def test_prediction_output_structure(self):
        inputs = {
            "N": 88, "P": 45, "K": 42,
            "temperature": 21.5, "humidity": 81.0,
            "ph": 6.7, "rainfall": 210.0
        }
        res = self.service.predict_crop_suitability(inputs, top_k=3)
        self.assertTrue(res["success"])
        self.assertIn("recommended_crop", res)
        self.assertIn("confidence", res)
        self.assertGreaterEqual(len(res["top_candidates"]), 2)
        # Check softmax sum property
        prob_sum = sum(c["probability"] for c in res["top_candidates"])
        self.assertGreater(prob_sum, 0.0)
        self.assertLessEqual(prob_sum, 1.05)

    def test_invalid_input_handling(self):
        bad_inputs = {
            "N": "invalid_nitrogen", "P": 45, "K": 42,
            "temperature": 21.5, "humidity": 81.0,
            "ph": 6.7, "rainfall": 210.0
        }
        res = self.service.predict_crop_suitability(bad_inputs)
        self.assertFalse(res["success"])
        self.assertGreater(len(res["errors"]), 0)

if __name__ == "__main__":
    unittest.main()
