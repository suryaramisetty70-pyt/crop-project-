"""
Data Loading, Verification, and Inspection Module
Handles authentic CSV loading, missing value detection, and class distributions.
"""

import os
import csv
from typing import List, Dict, Any, Tuple
from .validation import validate_csv_schema, REQUIRED_FEATURES

class DataLoader:
    def __init__(self, filepath: str):
        self.filepath = filepath
        self.raw_data: List[Dict[str, Any]] = []
        self.labels: List[str] = []
        self.feature_names = REQUIRED_FEATURES

    def load_and_validate(self) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Loads CSV file, checks schema, checks missing values, and returns stats.
        """
        if not os.path.exists(self.filepath):
            return False, f"File not found: {self.filepath}", {}

        with open(self.filepath, mode='r', encoding='utf-8') as f:
            reader = csv.reader(f)
            try:
                headers = next(reader)
            except StopIteration:
                return False, "CSV file is empty.", {}

            valid_schema, schema_errors = validate_csv_schema(headers)
            if not valid_schema:
                return False, f"Schema mismatch: {', '.join(schema_errors)}", {}

            # Map header indices
            header_map = {h.strip().lower(): i for i, h in enumerate(headers)}
            label_col = "label" if "label" in header_map else "crop"
            label_idx = header_map[label_col]

            rows = []
            missing_count = 0
            row_idx = 1
            for line in reader:
                row_idx += 1
                if not line or len(line) < len(headers):
                    continue
                record: Dict[str, Any] = {}
                row_has_missing = False
                for feat in self.feature_names:
                    idx = header_map[feat.lower()]
                    val_str = line[idx].strip()
                    if val_str == "" or val_str.lower() == "nan" or val_str.lower() == "null":
                        row_has_missing = True
                        break
                    try:
                        record[feat] = float(val_str)
                    except ValueError:
                        row_has_missing = True
                        break

                label_val = line[label_idx].strip().lower()
                if not label_val:
                    row_has_missing = True

                if row_has_missing:
                    missing_count += 1
                    continue

                record["label"] = label_val
                rows.append(record)

        self.raw_data = rows
        self.labels = sorted(list(set(r["label"] for r in rows)))

        # Summary statistics
        class_counts = {}
        for r in rows:
            class_counts[r["label"]] = class_counts.get(r["label"], 0) + 1

        summary = {
            "total_records": len(rows),
            "missing_records_dropped": missing_count,
            "unique_crops_count": len(self.labels),
            "crop_classes": self.labels,
            "class_distribution": class_counts,
            "features": self.feature_names
        }

        return True, f"Successfully loaded {len(rows)} authentic records across {len(self.labels)} crops.", summary

    def get_records(self) -> List[Dict[str, Any]]:
        return self.raw_data

    def get_labels(self) -> List[str]:
        return self.labels
