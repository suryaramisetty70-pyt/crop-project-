import unittest
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from src.data_loader import DataLoader
from src.validation import validate_agricultural_inputs, validate_csv_schema

class TestDataLoader(unittest.TestCase):
    def setUp(self):
        self.csv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../data/Crop_recommendation.csv"))

    def test_file_exists_and_loads(self):
        self.assertTrue(os.path.exists(self.csv_path), "Crop_recommendation.csv must exist in data/ folder")
        loader = DataLoader(self.csv_path)
        success, msg, summary = loader.load_and_validate()
        self.assertTrue(success, f"Failed to load dataset: {msg}")
        self.assertGreaterEqual(summary["total_records"], 2000)
        self.assertEqual(summary["unique_crops_count"], 22)
        self.assertIn("rice", summary["crop_classes"])
        self.assertIn("chickpea", summary["crop_classes"])

    def test_schema_validator(self):
        valid_headers = ["N", "P", "K", "temperature", "humidity", "ph", "rainfall", "label"]
        ok, errors = validate_csv_schema(valid_headers)
        self.assertTrue(ok)
        self.assertEqual(len(errors), 0)

        invalid_headers = ["Nitrogen", "Phosphorus", "Crop"]
        ok_inv, errors_inv = validate_csv_schema(invalid_headers)
        self.assertFalse(ok_inv)
        self.assertGreater(len(errors_inv), 0)

    def test_agricultural_input_bounds(self):
        valid_input = {
            "N": 80, "P": 40, "K": 40,
            "temperature": 25.0, "humidity": 80.0,
            "ph": 6.5, "rainfall": 200.0
        }
        ok, errs = validate_agricultural_inputs(valid_input)
        self.assertTrue(ok)
        self.assertEqual(len(errs), 0)

        out_of_bounds_input = {
            "N": 999, "P": 40, "K": 40,
            "temperature": 25.0, "humidity": 80.0,
            "ph": 19.5, "rainfall": 200.0
        }
        ok_bad, errs_bad = validate_agricultural_inputs(out_of_bounds_input)
        self.assertFalse(ok_bad)
        self.assertGreater(len(errs_bad), 0)

if __name__ == "__main__":
    unittest.main()
