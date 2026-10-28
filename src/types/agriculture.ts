/**
 * Agricultural and Machine Learning Type Definitions
 * Minor Project-I: An Artificial Neural Network Approach for Optimizing Crop Rotation and Agricultural Productivity
 */

export interface AgriculturalRecord {
  id?: number;
  N: number;            // Nitrogen in soil (kg/ha or ratio)
  P: number;            // Phosphorus in soil (kg/ha or ratio)
  K: number;            // Potassium in soil (kg/ha or ratio)
  temperature: number;  // Temperature in Celsius
  humidity: number;     // Relative humidity in percentage (%)
  ph: number;           // Soil pH (0 - 14)
  rainfall: number;     // Rainfall in mm
  label: string;        // Target crop name (e.g. rice, maize, chickpea...)
}

export type Season = 'Kharif' | 'Rabi' | 'Zaid' | 'Perennial' | 'All';
export type WaterRequirement = 'Low' | 'Medium' | 'High' | 'Very High';
export type FeederType = 'Heavy Feeder' | 'Light Feeder' | 'Soil Builder' | 'Perennial Tree';

export interface CropMetadata {
  id: string;
  name: string;
  scientificName: string;
  family: string;
  season: Season;
  durationDays: string;
  waterRequirement: WaterRequirement;
  feederType: FeederType;
  isLegume: boolean;
  nitrogenFixationKgPerHa?: number;
  idealRanges: {
    N: [number, number];
    P: [number, number];
    K: [number, number];
    temperature: [number, number];
    humidity: [number, number];
    ph: [number, number];
    rainfall: [number, number];
  };
  rotationConsiderations: string;
  incompatiblePredecessors: string[]; // crop families or specific crops that shouldn't immediately precede
  favorablePredecessors: string[];    // crop families or crops that improve soil for this
}

export interface ScalerParameters {
  features: string[];
  means: Record<string, number>;
  stds: Record<string, number>;
}

export interface TrainingHyperparameters {
  learningRate: number;
  epochs: number;
  batchSize: number;
  hiddenLayers: number[]; // e.g. [64, 32]
  validationSplit: number; // e.g. 0.15
  testSplit: number;       // e.g. 0.15
}

export interface EpochMetric {
  epoch: number;
  loss: number;
  accuracy: number;
  valLoss: number;
  valAccuracy: number;
}

export interface ClassPerformance {
  crop: string;
  precision: number;
  recall: number;
  f1Score: number;
  support: number;
}

export interface EvaluationResults {
  testAccuracy: number;
  macroPrecision: number;
  macroRecall: number;
  macroF1: number;
  weightedF1: number;
  classMetrics: Record<string, ClassPerformance>;
  confusionMatrix: number[][]; // [trueLabelIndex][predictedLabelIndex]
  labels: string[];
  totalTestSamples: number;
}

export interface TrainedModelArtifact {
  modelId: string;
  trainedAt: string;
  datasetName: string;
  totalRecords: number;
  labels: string[];
  scaler: ScalerParameters;
  weights: {
    w1: number[][]; // input (7) -> hidden1 (64)
    b1: number[];
    w2: number[][]; // hidden1 (64) -> hidden2 (32)
    b2: number[];
    w3: number[][]; // hidden2 (32) -> output (numClasses)
    b3: number[];
  };
  hyperparameters: TrainingHyperparameters;
  history: EpochMetric[];
  evaluation: EvaluationResults;
}

export interface PredictionCandidate {
  crop: string;
  probability: number; // 0 to 1
  percentage: number;  // 0 to 100
  metadata?: CropMetadata;
  suitabilityScore: number;
  parameterFit: {
    N: number;
    P: number;
    K: number;
    temperature: number;
    humidity: number;
    ph: number;
    rainfall: number;
  };
}

export interface SinglePredictionResult {
  input: {
    nitrogen: number;
    phosphorus: number;
    potassium: number;
    temperature: number;
    humidity: number;
    ph: number;
    rainfall: number;
    previousCrop?: string;
  };
  topCandidates: PredictionCandidate[];
  recommendedCrop: string;
  confidence: number;
  timestamp: string;
}

export interface RotationSeasonStep {
  seasonIndex: number;
  seasonName: Season;
  calendarMonth: string;
  crop: string;
  family: string;
  annSuitability: number;
  rotationScore: number;
  soilImpact: {
    nitrogenChange: string;
    pestRiskReduction: string;
    waterFeasibility: string;
  };
  rationale: string;
  ruleViolations: string[];
  ruleBonuses: string[];
}

export interface RotationPlan {
  id?: number;
  timestamp: string;
  fieldName: string;
  initialSoil: {
    N: number;
    P: number;
    K: number;
    ph: number;
    rainfall: number;
    previousCrop: string;
  };
  seasonsCount: number;
  sequence: RotationSeasonStep[];
  totalScore: number;
  comparisonWithMonoculture: {
    monocultureRisk: string;
    rotationBenefits: string[];
    soilNutrientTrajectory: string;
  };
  rationale: string;
}

export interface SavedHistoryItem {
  id: number;
  timestamp: string;
  type: 'prediction' | 'rotation';
  title: string;
  summary: string;
  details: SinglePredictionResult | RotationPlan;
}
