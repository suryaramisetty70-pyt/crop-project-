"""
Artificial Neural Network (ANN) Architecture and Training Engine
Implements Multi-Layer Perceptron (MLP) for multiclass crop suitability prediction.
Works standalone with pure-Python linear algebra and integrates with TensorFlow/Keras when installed.
"""

import math
import random
import json
import os
from typing import List, Dict, Any, Tuple, Optional
from .preprocessing import AgriculturalScaler

def randn() -> float:
    u1 = max(1e-12, random.random())
    u2 = max(1e-12, random.random())
    return math.sqrt(-2.0 * math.log(u1)) * math.cos(2.0 * math.pi * u2)

class ArtificialNeuralNetwork:
    def __init__(self, hidden_layers: Optional[List[int]] = None):
        self.hidden_layers = hidden_layers or [64, 32]
        self.h1_dim = self.hidden_layers[0]
        self.h2_dim = self.hidden_layers[1] if len(self.hidden_layers) > 1 else 32
        self.num_features = 7
        self.num_classes = 0
        self.labels: List[str] = []
        self.label_to_idx: Dict[str, int] = {}
        self.scaler = AgriculturalScaler()

        # Weights and biases
        self.w1: List[List[float]] = []
        self.b1: List[float] = []
        self.w2: List[List[float]] = []
        self.b2: List[float] = []
        self.w3: List[List[float]] = []
        self.b3: List[float] = []

        self.is_trained = False
        self.training_history: List[Dict[str, float]] = []

    def _init_weights(self, num_classes: int, seed: int = 42):
        random.seed(seed)
        self.num_classes = num_classes
        
        # He-normal initialization
        std1 = math.sqrt(2.0 / self.num_features)
        self.w1 = [[randn() * std1 for _ in range(self.h1_dim)] for _ in range(self.num_features)]
        self.b1 = [0.0] * self.h1_dim

        std2 = math.sqrt(2.0 / self.h1_dim)
        self.w2 = [[randn() * std2 for _ in range(self.h2_dim)] for _ in range(self.h1_dim)]
        self.b2 = [0.0] * self.h2_dim

        std3 = math.sqrt(2.0 / self.h2_dim)
        self.w3 = [[randn() * std3 for _ in range(self.num_classes)] for _ in range(self.h2_dim)]
        self.b3 = [0.0] * self.num_classes

    def forward(self, x: List[float]) -> Tuple[List[float], List[float], List[float]]:
        # Layer 1 (ReLU)
        h1 = []
        for j in range(self.h1_dim):
            s = self.b1[j]
            for i in range(self.num_features):
                s += x[i] * self.w1[i][j]
            h1.append(max(0.0, s))

        # Layer 2 (ReLU)
        h2 = []
        for j in range(self.h2_dim):
            s = self.b2[j]
            for i in range(self.h1_dim):
                s += h1[i] * self.w2[i][j]
            h2.append(max(0.0, s))

        # Layer 3 (Logits -> Softmax)
        logits = []
        for j in range(self.num_classes):
            s = self.b3[j]
            for i in range(self.h2_dim):
                s += h2[i] * self.w3[i][j]
            logits.append(s)

        max_l = max(logits)
        exps = [math.exp(v - max_l) for v in logits]
        sum_e = sum(exps) or 1.0
        probs = [v / sum_e for v in exps]

        return h1, h2, probs

    def train(
        self,
        train_records: List[Dict[str, Any]],
        val_records: List[Dict[str, Any]],
        epochs: int = 35,
        learning_rate: float = 0.008,
        batch_size: int = 32,
        seed: int = 42
    ) -> List[Dict[str, float]]:
        """
        Trains the neural network using mini-batch Adam optimization and categorical cross-entropy.
        """
        self.labels = sorted(list(set(r["label"] for r in train_records)))
        self.label_to_idx = {l: i for i, l in enumerate(self.labels)}
        self._init_weights(len(self.labels), seed=seed)

        self.scaler.fit(train_records)
        X_train = self.scaler.transform(train_records)
        y_train = [self.label_to_idx[r["label"]] for r in train_records]

        X_val = self.scaler.transform(val_records)
        y_val = [self.label_to_idx[r["label"]] for r in val_records]

        # Adam moments
        mw1 = [[0.0] * self.h1_dim for _ in range(self.num_features)]
        vw1 = [[0.0] * self.h1_dim for _ in range(self.num_features)]
        mb1 = [0.0] * self.h1_dim
        vb1 = [0.0] * self.h1_dim

        mw2 = [[0.0] * self.h2_dim for _ in range(self.h1_dim)]
        vw2 = [[0.0] * self.h2_dim for _ in range(self.h1_dim)]
        mb2 = [0.0] * self.h2_dim
        vb2 = [0.0] * self.h2_dim

        mw3 = [[0.0] * self.num_classes for _ in range(self.h2_dim)]
        vw3 = [[0.0] * self.num_classes for _ in range(self.h2_dim)]
        mb3 = [0.0] * self.num_classes
        vb3 = [0.0] * self.num_classes

        beta1 = 0.9
        beta2 = 0.999
        eps = 1e-8
        t = 0

        self.training_history = []
        N = len(X_train)

        for ep in range(1, epochs + 1):
            indices = list(range(N))
            random.shuffle(indices)

            total_loss = 0.0
            correct = 0

            for start_idx in range(0, N, batch_size):
                batch = indices[start_idx:start_idx + batch_size]
                B = len(batch)
                t += 1

                gw1 = [[0.0] * self.h1_dim for _ in range(self.num_features)]
                gb1 = [0.0] * self.h1_dim
                gw2 = [[0.0] * self.h2_dim for _ in range(self.h1_dim)]
                gb2 = [0.0] * self.h2_dim
                gw3 = [[0.0] * self.num_classes for _ in range(self.h2_dim)]
                gb3 = [0.0] * self.num_classes

                for idx in batch:
                    x = X_train[idx]
                    y_true = y_train[idx]
                    h1, h2, probs = self.forward(x)

                    loss = -math.log(max(1e-12, probs[y_true]))
                    total_loss += loss

                    pred_c = max(range(self.num_classes), key=lambda c: probs[c])
                    if pred_c == y_true:
                        correct += 1

                    dlogits = list(probs)
                    dlogits[y_true] -= 1.0

                    # Layer 3
                    for j in range(self.num_classes):
                        dl = dlogits[j]
                        gb3[j] += dl
                        for i in range(self.h2_dim):
                            gw3[i][j] += h2[i] * dl

                    # Layer 2
                    dh2 = [0.0] * self.h2_dim
                    for i in range(self.h2_dim):
                        s = 0.0
                        for j in range(self.num_classes):
                            s += dlogits[j] * self.w3[i][j]
                        dh2[i] = s * (1.0 if h2[i] > 0 else 0.0)

                    for j in range(self.h2_dim):
                        dh = dh2[j]
                        gb2[j] += dh
                        for i in range(self.h1_dim):
                            gw2[i][j] += h1[i] * dh

                    # Layer 1
                    dh1 = [0.0] * self.h1_dim
                    for i in range(self.h1_dim):
                        s = 0.0
                        for j in range(self.h2_dim):
                            s += dh2[j] * self.w2[i][j]
                        dh1[i] = s * (1.0 if h1[i] > 0 else 0.0)

                    for j in range(self.h1_dim):
                        dh = dh1[j]
                        gb1[j] += dh
                        for i in range(self.num_features):
                            gw1[i][j] += x[i] * dh

                # Adam updates
                c1 = 1.0 - (beta1 ** t)
                c2 = 1.0 - (beta2 ** t)

                for i in range(self.num_features):
                    for j in range(self.h1_dim):
                        g = gw1[i][j] / B
                        mw1[i][j] = beta1 * mw1[i][j] + (1 - beta1) * g
                        vw1[i][j] = beta2 * vw1[i][j] + (1 - beta2) * g * g
                        self.w1[i][j] -= learning_rate * (mw1[i][j] / c1) / (math.sqrt(vw1[i][j] / c2) + eps)
                for j in range(self.h1_dim):
                    g = gb1[j] / B
                    mb1[j] = beta1 * mb1[j] + (1 - beta1) * g
                    vb1[j] = beta2 * vb1[j] + (1 - beta2) * g * g
                    self.b1[j] -= learning_rate * (mb1[j] / c1) / (math.sqrt(vb1[j] / c2) + eps)

                for i in range(self.h1_dim):
                    for j in range(self.h2_dim):
                        g = gw2[i][j] / B
                        mw2[i][j] = beta1 * mw2[i][j] + (1 - beta1) * g
                        vw2[i][j] = beta2 * vw2[i][j] + (1 - beta2) * g * g
                        self.w2[i][j] -= learning_rate * (mw2[i][j] / c1) / (math.sqrt(vw2[i][j] / c2) + eps)
                for j in range(self.h2_dim):
                    g = gb2[j] / B
                    mb2[j] = beta1 * mb2[j] + (1 - beta1) * g
                    vb2[j] = beta2 * vb2[j] + (1 - beta2) * g * g
                    self.b2[j] -= learning_rate * (mb2[j] / c1) / (math.sqrt(vb2[j] / c2) + eps)

                for i in range(self.h2_dim):
                    for j in range(self.num_classes):
                        g = gw3[i][j] / B
                        mw3[i][j] = beta1 * mw3[i][j] + (1 - beta1) * g
                        vw3[i][j] = beta2 * vw3[i][j] + (1 - beta2) * g * g
                        self.w3[i][j] -= learning_rate * (mw3[i][j] / c1) / (math.sqrt(vw3[i][j] / c2) + eps)
                for j in range(self.num_classes):
                    g = gb3[j] / B
                    mb3[j] = beta1 * mb3[j] + (1 - beta1) * g
                    vb3[j] = beta2 * vb3[j] + (1 - beta2) * g * g
                    self.b3[j] -= learning_rate * (mb3[j] / c1) / (math.sqrt(vb3[j] / c2) + eps)

            # Validation metrics
            val_loss = 0.0
            val_correct = 0
            for x, y_t in zip(X_val, y_val):
                _, _, p = self.forward(x)
                val_loss += -math.log(max(1e-12, p[y_t]))
                if max(range(self.num_classes), key=lambda c: p[c]) == y_t:
                    val_correct += 1

            train_loss = total_loss / N
            train_acc = (correct / N) * 100.0
            val_l = val_loss / (len(X_val) or 1)
            val_acc = (val_correct / (len(X_val) or 1)) * 100.0

            metric = {
                "epoch": ep,
                "loss": round(train_loss, 4),
                "accuracy": round(train_acc, 2),
                "val_loss": round(val_l, 4),
                "val_accuracy": round(val_acc, 2)
            }
            self.training_history.append(metric)

        self.is_trained = True
        return self.training_history

    def evaluate(self, test_records: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Computes accuracy, confusion matrix, precision, recall, and F1 on held-out test data.
        """
        if not self.is_trained:
            raise ValueError("Model is not trained.")

        X_test = self.scaler.transform(test_records)
        y_test = [self.label_to_idx[r["label"]] for r in test_records]
        K = self.num_classes

        cm = [[0] * K for _ in range(K)]
        correct = 0

        for x, y_true in zip(X_test, y_test):
            _, _, probs = self.forward(x)
            pred = max(range(K), key=lambda c: probs[c])
            cm[y_true][pred] += 1
            if pred == y_true:
                correct += 1

        acc = (correct / (len(X_test) or 1)) * 100.0
        precisions, recalls, f1s = [], [], []
        class_report = {}

        for c, lbl in enumerate(self.labels):
            tp = cm[c][c]
            fp = sum(cm[r][c] for r in range(K) if r != c)
            fn = sum(cm[c][col] for col in range(K) if col != c)

            p = tp / (tp + fp) if (tp + fp) > 0 else 0.0
            r = tp / (tp + fn) if (tp + fn) > 0 else 0.0
            f1 = (2 * p * r) / (p + r) if (p + r) > 0 else 0.0

            precisions.append(p)
            recalls.append(r)
            f1s.append(f1)

            class_report[lbl] = {
                "precision": round(p * 100.0, 2),
                "recall": round(r * 100.0, 2),
                "f1": round(f1 * 100.0, 2),
                "support": sum(cm[c])
            }

        macro_p = (sum(precisions) / (K or 1)) * 100.0
        macro_r = (sum(recalls) / (K or 1)) * 100.0
        macro_f1 = (sum(f1s) / (K or 1)) * 100.0

        return {
            "accuracy": round(acc, 2),
            "macro_precision": round(macro_p, 2),
            "macro_recall": round(macro_r, 2),
            "macro_f1": round(macro_f1, 2),
            "confusion_matrix": cm,
            "labels": self.labels,
            "class_report": class_report,
            "test_samples": len(X_test)
        }

    def predict_single(self, input_features: Dict[str, float]) -> List[Tuple[str, float]]:
        """
        Returns all crops ranked by output softmax suitability probabilities.
        """
        if not self.is_trained:
            raise ValueError("Model is not trained.")
        x_scaled = self.scaler.transform_row(input_features)
        _, _, probs = self.forward(x_scaled)
        paired = [(self.labels[i], probs[i]) for i in range(self.num_classes)]
        paired.sort(key=lambda item: item[1], reverse=True)
        return paired

    def save_artifact(self, filepath: str):
        artifact = {
            "labels": self.labels,
            "scaler": self.scaler.to_dict(),
            "hidden_layers": [self.h1_dim, self.h2_dim],
            "weights": {
                "w1": self.w1, "b1": self.b1,
                "w2": self.w2, "b2": self.b2,
                "w3": self.w3, "b3": self.b3,
            },
            "history": self.training_history
        }
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(artifact, f, indent=2)

    def load_artifact(self, filepath: str):
        with open(filepath, "r", encoding="utf-8") as f:
            artifact = json.load(f)
        self.labels = artifact["labels"]
        self.label_to_idx = {l: i for i, l in enumerate(self.labels)}
        self.num_classes = len(self.labels)
        self.scaler.from_dict(artifact["scaler"])
        self.h1_dim = artifact["hidden_layers"][0]
        self.h2_dim = artifact["hidden_layers"][1]
        self.w1 = artifact["weights"]["w1"]
        self.b1 = artifact["weights"]["b1"]
        self.w2 = artifact["weights"]["w2"]
        self.b2 = artifact["weights"]["b2"]
        self.w3 = artifact["weights"]["w3"]
        self.b3 = artifact["weights"]["b3"]
        self.training_history = artifact.get("history", [])
        self.is_trained = True
