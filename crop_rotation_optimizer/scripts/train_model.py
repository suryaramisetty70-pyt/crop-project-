#!/usr/bin/env python3
"""
Model Training Script
Minor Project: An Artificial Neural Network Approach for Optimizing Crop Rotation and Agricultural Productivity

Usage:
    python scripts/train_model.py [--dataset data/Crop_recommendation.csv] [--epochs 35]
"""

import os
import sys
import argparse

# Add parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.data_loader import DataLoader
from src.preprocessing import stratified_train_val_test_split
from src.ann_model import ArtificialNeuralNetwork

def main():
    parser = argparse.ArgumentParser(description="Train ANN Crop Suitability Classifier")
    parser.add_argument("--dataset", type=str, default="data/Crop_recommendation.csv", help="Path to agricultural dataset CSV")
    parser.add_argument("--epochs", type=int, default=35, help="Number of training epochs")
    parser.add_argument("--lr", type=float, default=0.008, help="Learning rate for Adam optimizer")
    parser.add_argument("--batch_size", type=int, default=32, help="Mini-batch size")
    parser.add_argument("--output", type=str, default="models/trained_ann.json", help="Path to save trained model artifact")
    args = parser.parse_args()

    print("=" * 70)
    print("  ARTIFICIAL NEURAL NETWORK (ANN) - CROP ROTATION & SUITABILITY")
    print("=" * 70)

    # 1. Ingest Data
    loader = DataLoader(args.dataset)
    success, msg, summary = loader.load_and_validate()
    if not success:
        print(f"Error loading dataset: {msg}")
        sys.exit(1)

    print(f"\n[+] {msg}")
    print(f"[+] Total samples: {summary['total_records']}")
    print(f"[+] Unique crop classes ({summary['unique_crops_count']}): {', '.join(summary['crop_classes'])}")

    # 2. Stratified Partitioning (70% Train, 15% Val, 15% Held-out Test)
    records = loader.get_records()
    train_set, val_set, test_set = stratified_train_val_test_split(records, val_ratio=0.15, test_ratio=0.15, seed=42)
    print(f"\n[+] Data Partitioning (Stratified):")
    print(f"    - Training Set:   {len(train_set)} samples (70%)")
    print(f"    - Validation Set: {len(val_set)} samples (15%)")
    print(f"    - Test Set:       {len(test_set)} samples (15% held-out)")

    # 3. Model Architecture & Training
    print(f"\n[+] Initializing Feed-Forward ANN Architecture:")
    print("    - Input Layer:    7 features [N, P, K, Temp, Humidity, pH, Rainfall]")
    print("    - Hidden Layer 1: 64 Neurons (ReLU activation, He-normal initialization)")
    print("    - Hidden Layer 2: 32 Neurons (ReLU activation)")
    print(f"    - Output Layer:   {len(summary['crop_classes'])} Classes (Softmax activation)")
    print("    - Optimizer:      Adam (beta1=0.9, beta2=0.999, lr=0.008)")
    print("    - Loss Function:  Categorical Cross-Entropy\n")

    ann = ArtificialNeuralNetwork(hidden_layers=[64, 32])
    print(f"[*] Training for {args.epochs} epochs (Batch Size: {args.batch_size})...")

    history = ann.train(
        train_records=train_set,
        val_records=val_set,
        epochs=args.epochs,
        learning_rate=args.lr,
        batch_size=args.batch_size,
        seed=42
    )

    for h in history:
        if h["epoch"] % 5 == 0 or h["epoch"] == args.epochs:
            print(f"    Epoch {h['epoch']:2d}/{args.epochs} | Train Loss: {h['loss']:.4f} | Train Acc: {h['accuracy']:.2f}% | Val Loss: {h['val_loss']:.4f} | Val Acc: {h['val_accuracy']:.2f}%")

    # 4. Independent Held-Out Test Evaluation
    print("\n" + "=" * 70)
    print("  HELD-OUT TEST SET EVALUATION METRICS")
    print("=" * 70)
    eval_res = ann.evaluate(test_set)
    print(f"\n[+] Test Accuracy on {eval_res['test_samples']} unseen samples: {eval_res['accuracy']}%")
    print(f"[+] Macro Precision: {eval_res['macro_precision']}%")
    print(f"[+] Macro Recall:    {eval_res['macro_recall']}%")
    print(f"[+] Macro F1-Score:  {eval_res['macro_f1']}%")

    # 5. Save Artifact
    ann.save_artifact(args.output)
    print(f"\n[+] Model artifact successfully saved to: {args.output}")
    print("=" * 70)

if __name__ == "__main__":
    main()
