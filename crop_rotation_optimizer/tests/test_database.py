import unittest
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from src.database import DatabaseManager

class TestDatabase(unittest.TestCase):
    def setUp(self):
        self.test_db_path = "test_crop_rotation.db"
        self.db = DatabaseManager(self.test_db_path)

    def tearDown(self):
        if os.path.exists(self.test_db_path):
            try:
                os.remove(self.test_db_path)
            except PermissionError:
                pass

    def test_save_and_retrieve_prediction(self):
        inputs = {
            "N": 80.0, "P": 40.0, "K": 40.0,
            "temperature": 25.0, "humidity": 80.0,
            "ph": 6.5, "rainfall": 200.0
        }
        top_candidates = [
            {"crop": "rice", "probability": 0.82, "suitability_percentage": 82.0},
            {"crop": "jute", "probability": 0.12, "suitability_percentage": 12.0}
        ]
        rec_id = self.db.save_prediction(
            inputs=inputs,
            recommended_crop="rice",
            confidence=82.0,
            top_candidates=top_candidates,
            previous_crop="None"
        )
        self.assertGreater(rec_id, 0)

        preds = self.db.get_predictions(limit=10)
        self.assertGreaterEqual(len(preds), 1)
        first = preds[0]
        self.assertEqual(first["recommended_crop"], "rice")
        self.assertEqual(first["n"], 80.0)
        self.assertEqual(len(first["top_candidates"]), 2)

    def test_save_and_retrieve_rotation_plan(self):
        sequence = [
            {"season": "Kharif", "crop": "rice", "score": 85.0},
            {"season": "Rabi", "crop": "chickpea", "score": 92.0}
        ]
        plan_id = self.db.save_rotation_plan(
            field_name="North Plot 4",
            seasons_count=2,
            start_season="Kharif",
            sequence=sequence
        )
        self.assertGreater(plan_id, 0)

        plans = self.db.get_rotation_plans(limit=10)
        self.assertGreaterEqual(len(plans), 1)
        self.assertEqual(plans[0]["field_name"], "North Plot 4")
        self.assertEqual(len(plans[0]["sequence"]), 2)

if __name__ == "__main__":
    unittest.main()
