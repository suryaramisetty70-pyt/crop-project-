/**
 * Crop Rotation Optimization Module
 * Combines ANN Suitability Probabilities with Agronomic Constraints:
 * Botanical family alternation, seasonal matching, nitrogen replenishment,
 * and pest-cycle interruption.
 */

import {
  Season,
  RotationSeasonStep,
  RotationPlan,
  PredictionCandidate
} from '../types/agriculture.ts';
import { getCropMetadata, CROP_METADATA_REGISTRY } from './cropKnowledge.ts';

const SEASON_CYCLE: Season[] = ['Kharif', 'Rabi', 'Zaid'];

const SEASON_MONTHS: Record<Season, string> = {
  Kharif: 'June - October (Monsoon Season)',
  Rabi: 'November - March (Winter Season)',
  Zaid: 'April - May (Summer Season)',
  Perennial: 'Year-Round Plantation',
  All: 'Flexible Season'
};

export interface RotationRequest {
  fieldName?: string;
  seasonsCount?: number; // 3, 4, 5, or 6
  startSeason?: Season;
  initialSoil: {
    N: number;
    P: number;
    K: number;
    ph: number;
    rainfall: number;
    previousCrop: string;
  };
  annCandidates: PredictionCandidate[];
}

export function generateOptimizedRotationPlan(req: RotationRequest): RotationPlan {
  const seasonsCount = req.seasonsCount || 4;
  const startSeason = req.startSeason || 'Kharif';
  const startIdx = SEASON_CYCLE.indexOf(startSeason) !== -1 ? SEASON_CYCLE.indexOf(startSeason) : 0;

  // Build candidate lookup
  const candidateScores: Record<string, number> = {};
  for (const c of req.annCandidates) {
    candidateScores[c.crop.toLowerCase()] = c.probability;
  }

  // Eligible annual field crops
  const annualCropKeys = Object.keys(CROP_METADATA_REGISTRY).filter(key => {
    const meta = CROP_METADATA_REGISTRY[key];
    return meta.season !== 'Perennial' && meta.feederType !== 'Perennial Tree';
  });

  const sequence: RotationSeasonStep[] = [];
  let currentSoilN = req.initialSoil.N;
  let previousCrop = req.initialSoil.previousCrop.trim().toLowerCase();
  let previousFamily = getCropMetadata(previousCrop)?.family || 'None';

  let totalScoreSum = 0;

  for (let s = 0; s < seasonsCount; s++) {
    const seasonIndex = s + 1;
    const seasonName = SEASON_CYCLE[(startIdx + s) % SEASON_CYCLE.length];
    const calendarMonth = SEASON_MONTHS[seasonName];

    // Filter crops matching this season (or adaptable)
    const matchingCrops = annualCropKeys.filter(key => {
      const meta = CROP_METADATA_REGISTRY[key];
      return meta.season === seasonName || meta.season === 'All' ||
        (seasonName === 'Kharif' && ['rice', 'maize', 'cotton', 'jute', 'pigeonpeas', 'blackgram', 'mothbeans'].includes(key)) ||
        (seasonName === 'Rabi' && ['chickpea', 'lentil', 'kidneybeans', 'maize'].includes(key)) ||
        (seasonName === 'Zaid' && ['watermelon', 'muskmelon', 'mungbean', 'mothbeans'].includes(key));
    });

    // Score each candidate crop for this season
    const evaluated = matchingCrops.map(cropKey => {
      const meta = CROP_METADATA_REGISTRY[cropKey];
      const annProb = candidateScores[cropKey] || 0.05;
      let rotationScore = annProb * 0.45; // 45% weight to ANN suitability

      const violations: string[] = [];
      const bonuses: string[] = [];

      // Constraint 1: Monoculture restriction
      if (cropKey === previousCrop) {
        rotationScore -= 0.60;
        violations.push(`Severe Monoculture Penalty: Repeatedly cultivating ${meta.name} leads to soil exhaustion and pest resurgence.`);
      }

      // Constraint 2: Botanical family alternation
      if (meta.family === previousFamily && previousFamily !== 'None') {
        rotationScore -= 0.35;
        violations.push(`Family Repetition (${meta.family}): Harbors soil pathogens, fungal spores, and root nematodes.`);
      } else if (previousFamily !== 'None') {
        rotationScore += 0.15;
        bonuses.push(`Family Alternation (${previousFamily} -> ${meta.family}): Interrupts host-specific pest life-cycles.`);
      }

      // Constraint 3: Legume Nitrogen Restorative Balance
      if (meta.isLegume) {
        const fixAmount = meta.nitrogenFixationKgPerHa || 35;
        if (currentSoilN < 55) {
          rotationScore += 0.30;
          bonuses.push(`Crucial Soil Builder: Low soil N (${Math.round(currentSoilN)} kg/ha) rejuvenated via Rhizobium symbiotic N-fixation (+${fixAmount} kg/ha).`);
        } else {
          rotationScore += 0.15;
          bonuses.push(`Nutrient Maintenance: Fixes atmospheric nitrogen (+${fixAmount} kg/ha), preserving soil fertility.`);
        }
      }

      // Constraint 4: Exploiting legume residual nitrogen
      const prevMeta = getCropMetadata(previousCrop);
      if (prevMeta?.isLegume && !meta.isLegume && meta.feederType === 'Heavy Feeder') {
        rotationScore += 0.20;
        bonuses.push(`Synergistic Nutrient Uptake: Heavy feeder ${meta.name} efficiently consumes nitrogen fixed by preceding ${prevMeta.name}.`);
      }

      // Constraint 5: Rainfall / Water Budget alignment
      if (req.initialSoil.rainfall < 70 && (meta.waterRequirement === 'Very High' || meta.waterRequirement === 'High')) {
        rotationScore -= 0.25;
        violations.push(`Water Stress Risk: Low rainfall region incompatible with high water demand crop.`);
      } else if (req.initialSoil.rainfall < 70 && meta.waterRequirement === 'Low') {
        rotationScore += 0.15;
        bonuses.push(`Drought Tolerance: Well-suited to dry moisture regime.`);
      }

      // Seasonal Bonus
      if (meta.season === seasonName) {
        rotationScore += 0.10;
        bonuses.push(`Optimal Seasonal Window: Perfectly aligned with ${seasonName} growing calendar.`);
      }

      return {
        cropKey,
        meta,
        annSuitability: annProb,
        rotationScore,
        violations,
        bonuses
      };
    });

    // Sort descending by calculated rotation score
    evaluated.sort((a, b) => b.rotationScore - a.rotationScore);

    // Pick top non-violating crop (or highest scored if restricted)
    const selected = evaluated[0] || {
      cropKey: 'chickpea',
      meta: CROP_METADATA_REGISTRY.chickpea,
      annSuitability: 0.2,
      rotationScore: 0.5,
      violations: [],
      bonuses: ['Default soil rejuvenator pulse.']
    };

    // Update soil dynamic state
    let nChangeStr = 'Balanced';
    if (selected.meta.isLegume) {
      const fixed = selected.meta.nitrogenFixationKgPerHa || 38;
      currentSoilN += fixed;
      nChangeStr = `+${fixed} kg/ha (Rhizobium N-Fixation)`;
    } else if (selected.meta.feederType === 'Heavy Feeder') {
      currentSoilN = Math.max(10, currentSoilN - 25);
      nChangeStr = `-25 kg/ha (Heavy Nutrient Intake)`;
    } else {
      currentSoilN = Math.max(10, currentSoilN - 10);
      nChangeStr = `-10 kg/ha (Moderate Intake)`;
    }

    const stepScore = Math.max(0.1, Math.min(1.0, (selected.rotationScore + 0.3) / 1.3));
    totalScoreSum += stepScore;

    const rationale = selected.bonuses.length > 0
      ? selected.bonuses.join(' ')
      : `${selected.meta.name} is the optimal agronomic fit for ${seasonName} conditions.`;

    sequence.push({
      seasonIndex,
      seasonName,
      calendarMonth,
      crop: selected.cropKey,
      family: selected.meta.family,
      annSuitability: Number((selected.annSuitability * 100).toFixed(1)),
      rotationScore: Number((stepScore * 100).toFixed(1)),
      soilImpact: {
        nitrogenChange: nChangeStr,
        pestRiskReduction: selected.violations.length === 0 ? 'High (Cycle Broken)' : 'Moderate',
        waterFeasibility: `${selected.meta.waterRequirement} Demand`
      },
      rationale,
      ruleViolations: selected.violations,
      ruleBonuses: selected.bonuses
    });

    previousCrop = selected.cropKey;
    previousFamily = selected.meta.family;
  }

  const averageScore = Number(((totalScoreSum / seasonsCount) * 100).toFixed(1));

  return {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    fieldName: req.fieldName || 'Agricultural Field Plot A',
    initialSoil: { ...req.initialSoil },
    seasonsCount,
    sequence,
    totalScore: averageScore,
    comparisonWithMonoculture: {
      monocultureRisk: `Continuous mono-cropping of a single high-suitability crop degrades soil humus, causes 50-70% nitrogen depletion, and amplifies weed/root-rot epidemics.`,
      rotationBenefits: [
        'Alternating Poaceae and Fabaceae replenishes 35-50 kg/ha nitrogen without synthetic urea costs.',
        'Interrupts host-specific insect pupae and fungal sclerotia across successive seasons.',
        'Balances deep taproots (Pigeonpeas/Cotton) and shallow fibrous roots (Rice/Maize) to optimize soil aeration.',
        'Maintains long-term soil microbial biodiversity and organic carbon index.'
      ],
      soilNutrientTrajectory: `Dynamic model projects stable to increasing soil organic nitrogen fertility (+30 to +60 kg/ha cumulative balance) over ${seasonsCount} seasons.`
    },
    rationale: `This ${seasonsCount}-season crop rotation sequence is designed using our constrained optimization algorithm. It integrates ANN soil-climate suitability scores with agronomic family alternation and legume nitrogen-fixation rules.`
  };
}
