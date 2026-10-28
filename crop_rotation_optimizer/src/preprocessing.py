"""
Feature Standardization and Stratified Splitting Module
Prevents data leakage by fitting scalers exclusively on the training partition.
"""

import math
import random
from typing import List, Dict, Any, Tuple
from .validation import REQUIRED_FEATURES

class AgriculturalScaler:
    def __init__(self):
        self.means: Dict[str, float] = {}
        self.stds: Dict[str, float] = {}
        self.features = REQUIRED_FEATURES

    def fit(self, train_records: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Computes mean and sample standard deviation on training records only.
        """
        N = len(train_records)
        if N == 0:
            raise ValueError("Cannot fit scaler on empty dataset.")

        self.means = {}
        self.stds = {}
        for feat in self.features:
            vals = [r[feat] for r in train_records]
            mean_val = sum(vals) / N
            variance = sum((x - mean_val) ** 2 for x in vals) / N
            std_val = math.sqrt(variance) if variance > 1e-7 else 1.0
            self.means[feat] = mean_val
            self.stds[feat] = std_val

        return {"means": self.means, "stds": self.stds, "features": self.features}

    def transform_row(self, row: Dict[str, Any]) -> List[float]:
        scaled = []
        for feat in self.features:
            m = self.means.get(feat, 0.0)
            s = self.stds.get(feat, 1.0)
            val = float(row.get(feat, m))
            scaled.append((val - m) / s)
        return scaled

    def transform(self, records: List[Dict[str, Any]]) -> List[List[float]]:
        return [self.transform_row(r) for r in records]

    def to_dict(self) -> Dict[str, Any]:
        return {"features": self.features, "means": self.means, "stds": self.stds}

    def from_dict(self, data: Dict[str, Any]):
        self.features = data.get("features", REQUIRED_FEATURES)
        self.means = data.get("means", {})
        self.stds = data.get("stds", {})

def stratified_train_val_test_split(
    records: List[Dict[str, Any]],
    val_ratio: float = 0.15,
    test_ratio: float = 0.15,
    seed: int = 42
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Stratifies the split across target crop classes so each crop is proportionally
    represented in Train, Validation, and Held-Out Test sets.
    """
    random.seed(seed)
    by_class: Dict[str, List[Dict[str, Any]]] = {}
    for r in records:
        lbl = r["label"]
        if lbl not in by_class:
            by_class[lbl] = []
        by_class[lbl].append(r)

    train_set, val_set, test_set = [], [], []

    for lbl, items in by_class.items():
        shuffled = list(items)
        random.shuffle(shuffled)
        total = len(shuffled)
        test_cnt = max(1, int(round(total * test_ratio)))
        val_cnt = max(1, int(round(total * val_ratio)))
        train_cnt = max(1, total - test_cnt - val_cnt)

        train_set.extend(shuffled[:train_cnt])
        val_set.extend(shuffled[train_cnt:train_cnt + val_cnt])
        test_set.extend(shuffled[train_cnt + val_cnt:])

    return train_set, val_set, test_set
