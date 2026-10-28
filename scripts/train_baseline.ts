import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { NeuralNetwork } from '../src/ml/annEngine.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const csvPath = path.resolve(__dirname, '../data/Crop_recommendation.csv');
const csvContent = fs.readFileSync(csvPath, 'utf8');
const lines = csvContent.trim().split('\n');
const records = [];

for (let i = 1; i < lines.length; i++) {
  const parts = lines[i].split(',').map(p => p.trim());
  if (parts.length >= 8) {
    records.push({
      N: parseFloat(parts[0]),
      P: parseFloat(parts[1]),
      K: parseFloat(parts[2]),
      temperature: parseFloat(parts[3]),
      humidity: parseFloat(parts[4]),
      ph: parseFloat(parts[5]),
      rainfall: parseFloat(parts[6]),
      label: parts[7].toLowerCase()
    });
  }
}

console.log('Training ANN on', records.length, 'records...');
const nn = new NeuralNetwork();
const start = Date.now();

nn.train(records, { epochs: 35, learningRate: 0.009, batchSize: 32 }).then(artifact => {
  const outputPath = path.resolve(__dirname, '../src/ml/pretrainedArtifact.json');
  fs.writeFileSync(outputPath, JSON.stringify(artifact, null, 2));
  console.log('Training completed in', Date.now() - start, 'ms!');
  console.log('Held-out Test Accuracy:', artifact.evaluation.testAccuracy + '%');
  console.log('Macro F1:', artifact.evaluation.macroF1 + '%');
}).catch(err => {
  console.error(err);
  process.exit(1);
});
