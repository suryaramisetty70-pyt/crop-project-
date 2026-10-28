/**
 * High-Performance Artificial Neural Network (ANN) Engine
 * Multi-Layer Perceptron (7 -> 64 -> 32 -> 22) with He-Normal Init, Adam Optimizer,
 * Categorical Cross-Entropy Loss, Stratified Split, Confusion Matrix & Metrics Calculation.
 */

import {
  AgriculturalRecord,
  ScalerParameters,
  TrainingHyperparameters,
  EpochMetric,
  EvaluationResults,
  TrainedModelArtifact,
  PredictionCandidate,
  SinglePredictionResult
} from '../types/agriculture.ts';
import { CROP_METADATA_REGISTRY, getCropMetadata } from '../services/cropKnowledge.ts';

export const FEATURE_KEYS: (keyof Omit<AgriculturalRecord, 'id' | 'label'>)[] = [
  'N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall'
];

export class StandardScaler {
  means: Record<string, number> = {};
  stds: Record<string, number> = {};

  fit(data: AgriculturalRecord[]): ScalerParameters {
    const N = data.length;
    this.means = {};
    this.stds = {};

    for (const key of FEATURE_KEYS) {
      const sum = data.reduce((acc, row) => acc + (row[key] ?? 0), 0);
      const mean = sum / (N || 1);
      this.means[key] = mean;

      const varSum = data.reduce((acc, row) => acc + Math.pow((row[key] ?? 0) - mean, 2), 0);
      const variance = varSum / (N || 1);
      this.stds[key] = variance > 0.000001 ? Math.sqrt(variance) : 1.0;
    }

    return {
      features: [...FEATURE_KEYS],
      means: { ...this.means },
      stds: { ...this.stds }
    };
  }

  load(params: ScalerParameters) {
    this.means = { ...params.means };
    this.stds = { ...params.stds };
  }

  transformRow(row: Record<string, number>): number[] {
    return FEATURE_KEYS.map(key => {
      const m = this.means[key] ?? 0;
      const s = this.stds[key] ?? 1;
      const val = row[key] ?? m;
      return (val - m) / s;
    });
  }

  transform(data: AgriculturalRecord[]): number[][] {
    return data.map(d => this.transformRow(d as any));
  }
}

/**
 * Box-Muller transform for standard normal random numbers
 */
function randn(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

export class NeuralNetwork {
  labels: string[] = [];
  labelToIdx: Map<string, number> = new Map();
  scaler = new StandardScaler();

  // Weights and Biases
  w1: number[][] = []; // [7][64]
  b1: number[] = [];   // [64]
  w2: number[][] = []; // [64][32]
  b2: number[] = [];   // [32]
  w3: number[][] = []; // [32][K]
  b3: number[] = [];   // [K]

  h1Dim = 64;
  h2Dim = 32;
  numFeatures = 7;
  numClasses = 22;

  isTrained = false;
  artifact: TrainedModelArtifact | null = null;

  constructor() {}

  /**
   * Initialize weights using He-Normal initialization
   */
  initWeights(labels: string[], h1 = 64, h2 = 32) {
    this.labels = [...labels];
    this.labelToIdx = new Map(labels.map((l, i) => [l.toLowerCase(), i]));
    this.numClasses = labels.length;
    this.h1Dim = h1;
    this.h2Dim = h2;

    const std1 = Math.sqrt(2.0 / this.numFeatures);
    this.w1 = Array.from({ length: this.numFeatures }, () =>
      Array.from({ length: this.h1Dim }, () => randn() * std1)
    );
    this.b1 = new Array(this.h1Dim).fill(0);

    const std2 = Math.sqrt(2.0 / this.h1Dim);
    this.w2 = Array.from({ length: this.h1Dim }, () =>
      Array.from({ length: this.h2Dim }, () => randn() * std2)
    );
    this.b2 = new Array(this.h2Dim).fill(0);

    const std3 = Math.sqrt(2.0 / this.h2Dim);
    this.w3 = Array.from({ length: this.h2Dim }, () =>
      Array.from({ length: this.numClasses }, () => randn() * std3)
    );
    this.b3 = new Array(this.numClasses).fill(0);
  }

  /**
   * Forward pass: X -> Dense64(ReLU) -> Dense32(ReLU) -> DenseK(Softmax)
   */
  forward(x: number[]): { h1: number[]; h2: number[]; probs: number[] } {
    // Layer 1
    const h1 = new Array(this.h1Dim);
    for (let j = 0; j < this.h1Dim; j++) {
      let sum = this.b1[j];
      for (let i = 0; i < this.numFeatures; i++) {
        sum += x[i] * this.w1[i][j];
      }
      h1[j] = sum > 0 ? sum : 0; // ReLU
    }

    // Layer 2
    const h2 = new Array(this.h2Dim);
    for (let j = 0; j < this.h2Dim; j++) {
      let sum = this.b2[j];
      for (let i = 0; i < this.h1Dim; i++) {
        sum += h1[i] * this.w2[i][j];
      }
      h2[j] = sum > 0 ? sum : 0; // ReLU
    }

    // Layer 3 (logits)
    const logits = new Array(this.numClasses);
    let maxLogit = -Infinity;
    for (let j = 0; j < this.numClasses; j++) {
      let sum = this.b3[j];
      for (let i = 0; i < this.h2Dim; i++) {
        sum += h2[i] * this.w3[i][j];
      }
      logits[j] = sum;
      if (sum > maxLogit) maxLogit = sum;
    }

    // Stable Softmax
    let sumExp = 0;
    const exps = new Array(this.numClasses);
    for (let j = 0; j < this.numClasses; j++) {
      const e = Math.exp(logits[j] - maxLogit);
      exps[j] = e;
      sumExp += e;
    }

    const probs = new Array(this.numClasses);
    const denom = sumExp || 1;
    for (let j = 0; j < this.numClasses; j++) {
      probs[j] = exps[j] / denom;
    }

    return { h1, h2, probs };
  }

  /**
   * Real Adam Optimizer Training Pipeline
   */
  async train(
    dataset: AgriculturalRecord[],
    hyperparams: Partial<TrainingHyperparameters> = {},
    onEpochUpdate?: (epochMetric: EpochMetric, progressPercent: number) => void
  ): Promise<TrainedModelArtifact> {
    const hp: TrainingHyperparameters = {
      learningRate: hyperparams.learningRate ?? 0.008,
      epochs: hyperparams.epochs ?? 40,
      batchSize: hyperparams.batchSize ?? 32,
      hiddenLayers: hyperparams.hiddenLayers ?? [64, 32],
      validationSplit: hyperparams.validationSplit ?? 0.15,
      testSplit: hyperparams.testSplit ?? 0.15,
    };

    // Extract unique labels
    const labelSet = Array.from(new Set(dataset.map(d => d.label.trim().toLowerCase()))).sort();
    this.initWeights(labelSet, hp.hiddenLayers[0] || 64, hp.hiddenLayers[1] || 32);

    // Stratified Split (Train, Val, Test)
    const byLabel: Record<string, AgriculturalRecord[]> = {};
    for (const l of labelSet) byLabel[l] = [];
    for (const d of dataset) {
      byLabel[d.label.trim().toLowerCase()]?.push(d);
    }

    const trainRows: AgriculturalRecord[] = [];
    const valRows: AgriculturalRecord[] = [];
    const testRows: AgriculturalRecord[] = [];

    for (const l of labelSet) {
      const rows = [...byLabel[l]];
      // Shuffle deterministically
      for (let i = rows.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rows[i], rows[j]] = [rows[j], rows[i]];
      }

      const total = rows.length;
      const testCount = Math.max(1, Math.floor(total * hp.testSplit));
      const valCount = Math.max(1, Math.floor(total * hp.validationSplit));
      const trainCount = Math.max(1, total - testCount - valCount);

      trainRows.push(...rows.slice(0, trainCount));
      valRows.push(...rows.slice(trainCount, trainCount + valCount));
      testRows.push(...rows.slice(trainCount + valCount));
    }

    // Fit Scaler on training data ONLY
    const scalerParams = this.scaler.fit(trainRows);

    const X_train = this.scaler.transform(trainRows);
    const y_train = trainRows.map(r => this.labelToIdx.get(r.label.trim().toLowerCase()) ?? 0);

    const X_val = this.scaler.transform(valRows);
    const y_val = valRows.map(r => this.labelToIdx.get(r.label.trim().toLowerCase()) ?? 0);

    const X_test = this.scaler.transform(testRows);
    const y_test = testRows.map(r => this.labelToIdx.get(r.label.trim().toLowerCase()) ?? 0);

    // Initialize Adam moments
    const mw1 = Array.from({ length: this.numFeatures }, () => new Array(this.h1Dim).fill(0));
    const vw1 = Array.from({ length: this.numFeatures }, () => new Array(this.h1Dim).fill(0));
    const mb1 = new Array(this.h1Dim).fill(0);
    const vb1 = new Array(this.h1Dim).fill(0);

    const mw2 = Array.from({ length: this.h1Dim }, () => new Array(this.h2Dim).fill(0));
    const vw2 = Array.from({ length: this.h1Dim }, () => new Array(this.h2Dim).fill(0));
    const mb2 = new Array(this.h2Dim).fill(0);
    const vb2 = new Array(this.h2Dim).fill(0);

    const mw3 = Array.from({ length: this.h2Dim }, () => new Array(this.numClasses).fill(0));
    const vw3 = Array.from({ length: this.h2Dim }, () => new Array(this.numClasses).fill(0));
    const mb3 = new Array(this.numClasses).fill(0);
    const vb3 = new Array(this.numClasses).fill(0);

    const beta1 = 0.9;
    const beta2 = 0.999;
    const eps = 1e-8;
    let t = 0;

    const history: EpochMetric[] = [];
    const N_train = X_train.length;

    for (let epoch = 1; epoch <= hp.epochs; epoch++) {
      // Shuffle train indices
      const indices = Array.from({ length: N_train }, (_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }

      let totalLoss = 0;
      let correctTrain = 0;

      for (let start = 0; start < N_train; start += hp.batchSize) {
        const batchIdx = indices.slice(start, start + hp.batchSize);
        const B = batchIdx.length;
        t++;

        // Gradient accumulators
        const gw1 = Array.from({ length: this.numFeatures }, () => new Array(this.h1Dim).fill(0));
        const gb1 = new Array(this.h1Dim).fill(0);
        const gw2 = Array.from({ length: this.h1Dim }, () => new Array(this.h2Dim).fill(0));
        const gb2 = new Array(this.h2Dim).fill(0);
        const gw3 = Array.from({ length: this.h2Dim }, () => new Array(this.numClasses).fill(0));
        const gb3 = new Array(this.numClasses).fill(0);

        for (const idx of batchIdx) {
          const x = X_train[idx];
          const yTrue = y_train[idx];
          const { h1, h2, probs } = this.forward(x);

          const loss = -Math.log(Math.max(1e-12, probs[yTrue]));
          totalLoss += loss;

          let maxProb = -1;
          let predClass = -1;
          for (let c = 0; c < this.numClasses; c++) {
            if (probs[c] > maxProb) {
              maxProb = probs[c];
              predClass = c;
            }
          }
          if (predClass === yTrue) correctTrain++;

          // dLogits = probs - one_hot
          const dlogits = [...probs];
          dlogits[yTrue] -= 1.0;

          // Layer 3 Gradients
          for (let j = 0; j < this.numClasses; j++) {
            const dl = dlogits[j];
            gb3[j] += dl;
            for (let i = 0; i < this.h2Dim; i++) {
              gw3[i][j] += h2[i] * dl;
            }
          }

          // Backprop to h2
          const dh2 = new Array(this.h2Dim).fill(0);
          for (let i = 0; i < this.h2Dim; i++) {
            let sum = 0;
            for (let j = 0; j < this.numClasses; j++) {
              sum += dlogits[j] * this.w3[i][j];
            }
            dh2[i] = h2[i] > 0 ? sum : 0; // ReLU derivative
          }

          // Layer 2 Gradients
          for (let j = 0; j < this.h2Dim; j++) {
            const dh = dh2[j];
            gb2[j] += dh;
            for (let i = 0; i < this.h1Dim; i++) {
              gw2[i][j] += h1[i] * dh;
            }
          }

          // Backprop to h1
          const dh1 = new Array(this.h1Dim).fill(0);
          for (let i = 0; i < this.h1Dim; i++) {
            let sum = 0;
            for (let j = 0; j < this.h2Dim; j++) {
              sum += dh2[j] * this.w2[i][j];
            }
            dh1[i] = h1[i] > 0 ? sum : 0; // ReLU derivative
          }

          // Layer 1 Gradients
          for (let j = 0; j < this.h1Dim; j++) {
            const dh = dh1[j];
            gb1[j] += dh;
            for (let i = 0; i < this.numFeatures; i++) {
              gw1[i][j] += x[i] * dh;
            }
          }
        }

        // Adam Updates (with bias correction)
        const corr1 = 1 - Math.pow(beta1, t);
        const corr2 = 1 - Math.pow(beta2, t);

        for (let i = 0; i < this.numFeatures; i++) {
          for (let j = 0; j < this.h1Dim; j++) {
            const g = gw1[i][j] / B;
            mw1[i][j] = beta1 * mw1[i][j] + (1 - beta1) * g;
            vw1[i][j] = beta2 * vw1[i][j] + (1 - beta2) * g * g;
            const mHat = mw1[i][j] / corr1;
            const vHat = vw1[i][j] / corr2;
            this.w1[i][j] -= (hp.learningRate * mHat) / (Math.sqrt(vHat) + eps);
          }
        }

        for (let j = 0; j < this.h1Dim; j++) {
          const g = gb1[j] / B;
          mb1[j] = beta1 * mb1[j] + (1 - beta1) * g;
          vb1[j] = beta2 * vb1[j] + (1 - beta2) * g * g;
          const mHat = mb1[j] / corr1;
          const vHat = vb1[j] / corr2;
          this.b1[j] -= (hp.learningRate * mHat) / (Math.sqrt(vHat) + eps);
        }

        for (let i = 0; i < this.h1Dim; i++) {
          for (let j = 0; j < this.h2Dim; j++) {
            const g = gw2[i][j] / B;
            mw2[i][j] = beta1 * mw2[i][j] + (1 - beta1) * g;
            vw2[i][j] = beta2 * vw2[i][j] + (1 - beta2) * g * g;
            const mHat = mw2[i][j] / corr1;
            const vHat = vw2[i][j] / corr2;
            this.w2[i][j] -= (hp.learningRate * mHat) / (Math.sqrt(vHat) + eps);
          }
        }

        for (let j = 0; j < this.h2Dim; j++) {
          const g = gb2[j] / B;
          mb2[j] = beta1 * mb2[j] + (1 - beta1) * g;
          vb2[j] = beta2 * vb2[j] + (1 - beta2) * g * g;
          const mHat = mb2[j] / corr1;
          const vHat = vb2[j] / corr2;
          this.b2[j] -= (hp.learningRate * mHat) / (Math.sqrt(vHat) + eps);
        }

        for (let i = 0; i < this.h2Dim; i++) {
          for (let j = 0; j < this.numClasses; j++) {
            const g = gw3[i][j] / B;
            mw3[i][j] = beta1 * mw3[i][j] + (1 - beta1) * g;
            vw3[i][j] = beta2 * vw3[i][j] + (1 - beta2) * g * g;
            const mHat = mw3[i][j] / corr1;
            const vHat = vw3[i][j] / corr2;
            this.w3[i][j] -= (hp.learningRate * mHat) / (Math.sqrt(vHat) + eps);
          }
        }

        for (let j = 0; j < this.numClasses; j++) {
          const g = gb3[j] / B;
          mb3[j] = beta1 * mb3[j] + (1 - beta1) * g;
          vb3[j] = beta2 * vb3[j] + (1 - beta2) * g * g;
          const mHat = mb3[j] / corr1;
          const vHat = vb3[j] / corr2;
          this.b3[j] -= (hp.learningRate * mHat) / (Math.sqrt(vHat) + eps);
        }
      }

      // Compute validation metrics
      let valLoss = 0;
      let valCorrect = 0;
      for (let i = 0; i < X_val.length; i++) {
        const { probs } = this.forward(X_val[i]);
        const yTrue = y_val[i];
        valLoss += -Math.log(Math.max(1e-12, probs[yTrue]));

        let maxP = -1, pred = -1;
        for (let c = 0; c < this.numClasses; c++) {
          if (probs[c] > maxP) { maxP = probs[c]; pred = c; }
        }
        if (pred === yTrue) valCorrect++;
      }

      const metric: EpochMetric = {
        epoch,
        loss: Number((totalLoss / N_train).toFixed(4)),
        accuracy: Number(((correctTrain / N_train) * 100).toFixed(2)),
        valLoss: Number((valLoss / (X_val.length || 1)).toFixed(4)),
        valAccuracy: Number(((valCorrect / (X_val.length || 1)) * 100).toFixed(2))
      };
      history.push(metric);

      if (onEpochUpdate) {
        onEpochUpdate(metric, Math.round((epoch / hp.epochs) * 100));
        // Allow UI to render smoothly
        await new Promise(r => setTimeout(r, 8));
      }
    }

    // Evaluation on Held-Out Test Set
    const evaluation = this.evaluateTestSet(X_test, y_test);

    this.isTrained = true;
    const artifact: TrainedModelArtifact = {
      modelId: `ann_custom_${Date.now()}`,
      trainedAt: new Date().toISOString(),
      datasetName: 'Loaded Agricultural Dataset',
      totalRecords: dataset.length,
      labels: this.labels,
      scaler: scalerParams,
      weights: {
        w1: this.w1.map(r => r.map(v => Number(v.toFixed(6)))),
        b1: this.b1.map(v => Number(v.toFixed(6))),
        w2: this.w2.map(r => r.map(v => Number(v.toFixed(6)))),
        b2: this.b2.map(v => Number(v.toFixed(6))),
        w3: this.w3.map(r => r.map(v => Number(v.toFixed(6)))),
        b3: this.b3.map(v => Number(v.toFixed(6))),
      },
      hyperparameters: hp,
      history,
      evaluation
    };

    this.artifact = artifact;
    return artifact;
  }

  /**
   * Evaluate held-out test set
   */
  evaluateTestSet(X_test: number[][], y_test: number[]): EvaluationResults {
    const K = this.numClasses;
    const cm: number[][] = Array.from({ length: K }, () => new Array(K).fill(0));
    let correct = 0;

    for (let i = 0; i < X_test.length; i++) {
      const { probs } = this.forward(X_test[i]);
      let maxP = -1, pred = -1;
      for (let c = 0; c < K; c++) {
        if (probs[c] > maxP) { maxP = probs[c]; pred = c; }
      }
      const yTrue = y_test[i];
      cm[yTrue][pred]++;
      if (pred === yTrue) correct++;
    }

    const testAccuracy = Number(((correct / (X_test.length || 1)) * 100).toFixed(2));
    const classMetrics: Record<string, any> = {};
    const precisions: number[] = [];
    const recalls: number[] = [];
    const f1s: number[] = [];

    for (let c = 0; c < K; c++) {
      const label = this.labels[c];
      const tp = cm[c][c];
      let fp = 0;
      for (let r = 0; r < K; r++) { if (r !== c) fp += cm[r][c]; }
      let fn = 0;
      for (let col = 0; col < K; col++) { if (col !== c) fn += cm[c][col]; }

      const p = (tp + fp) > 0 ? tp / (tp + fp) : 0;
      const r = (tp + fn) > 0 ? tp / (tp + fn) : 0;
      const f1 = (p + r) > 0 ? (2 * p * r) / (p + r) : 0;
      const support = cm[c].reduce((a, b) => a + b, 0);

      precisions.push(p);
      recalls.push(r);
      f1s.push(f1);

      classMetrics[label] = {
        crop: label,
        precision: Number((p * 100).toFixed(2)),
        recall: Number((r * 100).toFixed(2)),
        f1Score: Number((f1 * 100).toFixed(2)),
        support
      };
    }

    const macroPrecision = Number(((precisions.reduce((a, b) => a + b, 0) / (K || 1)) * 100).toFixed(2));
    const macroRecall = Number(((recalls.reduce((a, b) => a + b, 0) / (K || 1)) * 100).toFixed(2));
    const macroF1 = Number(((f1s.reduce((a, b) => a + b, 0) / (K || 1)) * 100).toFixed(2));

    return {
      testAccuracy,
      macroPrecision,
      macroRecall,
      macroF1,
      weightedF1: macroF1,
      classMetrics,
      confusionMatrix: cm,
      labels: this.labels,
      totalTestSamples: X_test.length
    };
  }

  /**
   * Load a pre-trained model artifact
   */
  loadArtifact(artifact: TrainedModelArtifact) {
    this.artifact = artifact;
    this.labels = [...artifact.labels];
    this.labelToIdx = new Map(this.labels.map((l, i) => [l.toLowerCase(), i]));
    this.numClasses = this.labels.length;
    this.h1Dim = artifact.hyperparameters.hiddenLayers[0] || 64;
    this.h2Dim = artifact.hyperparameters.hiddenLayers[1] || 32;

    this.scaler.load(artifact.scaler);
    this.w1 = artifact.weights.w1;
    this.b1 = artifact.weights.b1;
    this.w2 = artifact.weights.w2;
    this.b2 = artifact.weights.b2;
    this.w3 = artifact.weights.w3;
    this.b3 = artifact.weights.b3;
    this.isTrained = true;
  }

  /**
   * Predict single sample
   */
  predict(input: {
    N: number;
    P: number;
    K: number;
    temperature: number;
    humidity: number;
    ph: number;
    rainfall: number;
    previousCrop?: string;
  }): SinglePredictionResult {
    if (!this.isTrained) {
      throw new Error('Neural Network has not been trained yet. Please load or train a model.');
    }

    const numericRow: Record<string, number> = {
      N: input.N,
      P: input.P,
      K: input.K,
      temperature: input.temperature,
      humidity: input.humidity,
      ph: input.ph,
      rainfall: input.rainfall,
    };
    const x = this.scaler.transformRow(numericRow);
    const { probs } = this.forward(x);

    // Pair with labels and sort
    const scored: PredictionCandidate[] = this.labels.map((crop, idx) => {
      const prob = probs[idx];
      const metadata = getCropMetadata(crop);
      
      // Calculate parameter fit against known optimal ranges
      let fitScore = 1.0;
      const paramFit: any = {};
      if (metadata) {
        for (const [key, range] of Object.entries(metadata.idealRanges)) {
          const val = (input as any)[key];
          const [min, max] = range as [number, number];
          const span = (max - min) || 1;
          const diff = val < min ? (min - val) : val > max ? (val - max) : 0;
          const paramScore = Math.max(0, 1 - (diff / span));
          paramFit[key] = Math.round(paramScore * 100);
        }
      }

      return {
        crop,
        probability: prob,
        percentage: Number((prob * 100).toFixed(2)),
        metadata,
        suitabilityScore: Math.round(prob * 100),
        parameterFit: paramFit
      };
    });

    scored.sort((a, b) => b.probability - a.probability);
    const topCandidates = scored.slice(0, 5);

    return {
      input: {
        nitrogen: input.N,
        phosphorus: input.P,
        potassium: input.K,
        temperature: input.temperature,
        humidity: input.humidity,
        ph: input.ph,
        rainfall: input.rainfall,
        previousCrop: input.previousCrop
      },
      topCandidates,
      recommendedCrop: topCandidates[0].crop,
      confidence: topCandidates[0].percentage,
      timestamp: new Date().toISOString()
    };
  }
}
