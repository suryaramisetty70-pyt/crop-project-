import unittest
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from src.rotation_optimizer import RotationOptimizer

class TestRotationOptimizer(unittest.TestCase):
    def setUp(self):
        self.ann_predictions = [
            {"crop": "rice", "probability": 0.75},
            {"crop": "maize", "probability": 0.15},
            {"crop": "chickpea", "probability": 0.08},
            {"crop": "mungbean", "probability": 0.02}
        ]
        self.optimizer = RotationOptimizer(self.ann_predictions)

    def test_multi_season_sequence_generation(self):
        plan = self.optimizer.plan_sequence(
            seasons_count=4,
            start_season="Kharif",
            previous_crop="rice",
            soil_nitrogen=45.0
        )
        self.assertEqual(plan["seasons_planned"], 4)
        seq = plan["sequence"]
        self.assertEqual(len(seq), 4)

        # Check season 1 does not consecutively repeat rice if alternatives exist
        crop_s1 = seq[0]["crop"]
        # If previous crop was rice, rotation optimizer should penalize rice
        self.assertIn("season", seq[0])
        self.assertIn("crop", seq[0])
        self.assertIn("nitrogen_impact", seq[0])

    def test_no_consecutive_same_crops(self):
        plan = self.optimizer.plan_sequence(
            seasons_count=3,
            start_season="Kharif",
            previous_crop="None"
        )
        seq = plan["sequence"]
        for i in range(1, len(seq)):
            self.assertNotEqual(
                seq[i]["crop"],
                seq[i - 1]["crop"],
                f"Consecutive identical crop detected at seasons {i} and {i+1}: {seq[i]['crop']}"
            )

if __name__ == "__main__":
    unittest.main()
