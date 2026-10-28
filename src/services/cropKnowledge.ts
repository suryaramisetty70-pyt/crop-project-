import { CropMetadata } from '../types/agriculture.ts';

export const CROP_METADATA_REGISTRY: Record<string, CropMetadata> = {
  rice: {
    id: 'rice',
    name: 'Rice (Paddy)',
    scientificName: 'Oryza sativa',
    family: 'Poaceae',
    season: 'Kharif',
    durationDays: '110-140 days',
    waterRequirement: 'Very High',
    feederType: 'Heavy Feeder',
    isLegume: false,
    idealRanges: {
      N: [60, 100], P: [35, 60], K: [35, 45],
      temperature: [20, 27], humidity: [80, 85], ph: [5.0, 7.8], rainfall: [180, 300]
    },
    rotationConsiderations: 'Continuous waterlogging causes anaerobic soil compaction. Follow with deep-rooted or nitrogen-fixing pulses (Chickpea, Lentil, Blackgram) to aerate soil and break pathogen cycles.',
    incompatiblePredecessors: ['rice'],
    favorablePredecessors: ['chickpea', 'lentil', 'mungbean', 'blackgram']
  },
  maize: {
    id: 'maize',
    name: 'Maize (Corn)',
    scientificName: 'Zea mays',
    family: 'Poaceae',
    season: 'Kharif',
    durationDays: '90-115 days',
    waterRequirement: 'Medium',
    feederType: 'Heavy Feeder',
    isLegume: false,
    idealRanges: {
      N: [60, 100], P: [35, 60], K: [15, 25],
      temperature: [18, 27], humidity: [55, 75], ph: [5.5, 7.5], rainfall: [60, 110]
    },
    rotationConsiderations: 'High nitrogen consumer. Fibrous root system breaks hardpan. Excellent companion in rotation with legumes like Chickpea or Pigeonpeas.',
    incompatiblePredecessors: ['maize'],
    favorablePredecessors: ['pigeonpeas', 'chickpea', 'kidneybeans', 'mungbean']
  },
  chickpea: {
    id: 'chickpea',
    name: 'Chickpea (Gram)',
    scientificName: 'Cicer arietinum',
    family: 'Fabaceae',
    season: 'Rabi',
    durationDays: '90-120 days',
    waterRequirement: 'Low',
    feederType: 'Soil Builder',
    isLegume: true,
    nitrogenFixationKgPerHa: 42,
    idealRanges: {
      N: [20, 60], P: [55, 80], K: [75, 85],
      temperature: [17, 21], humidity: [14, 20], ph: [6.0, 8.5], rainfall: [65, 95]
    },
    rotationConsiderations: 'Premier soil rejuvenating pulse. Fixes 35-50 kg/ha atmospheric nitrogen via Rhizobium nodules. Recharges soil after heavy cereals like Rice and Maize.',
    incompatiblePredecessors: ['chickpea', 'lentil'],
    favorablePredecessors: ['rice', 'maize', 'cotton']
  },
  kidneybeans: {
    id: 'kidneybeans',
    name: 'Kidney Beans (Rajma)',
    scientificName: 'Phaseolus vulgaris',
    family: 'Fabaceae',
    season: 'Rabi',
    durationDays: '95-125 days',
    waterRequirement: 'Medium',
    feederType: 'Soil Builder',
    isLegume: true,
    nitrogenFixationKgPerHa: 30,
    idealRanges: {
      N: [10, 40], P: [55, 80], K: [15, 25],
      temperature: [15, 26], humidity: [18, 25], ph: [5.5, 6.0], rainfall: [60, 150]
    },
    rotationConsiderations: 'Prefers cool conditions and slightly acidic to neutral soils. Leaves nitrogenous residues.',
    incompatiblePredecessors: ['kidneybeans', 'blackgram'],
    favorablePredecessors: ['maize', 'rice']
  },
  pigeonpeas: {
    id: 'pigeonpeas',
    name: 'Pigeonpeas (Arhar / Red Gram)',
    scientificName: 'Cajanus cajan',
    family: 'Fabaceae',
    season: 'Kharif',
    durationDays: '150-180 days',
    waterRequirement: 'Medium',
    feederType: 'Soil Builder',
    isLegume: true,
    nitrogenFixationKgPerHa: 50,
    idealRanges: {
      N: [10, 40], P: [55, 80], K: [15, 25],
      temperature: [20, 38], humidity: [30, 70], ph: [5.0, 7.5], rainfall: [90, 200]
    },
    rotationConsiderations: 'Deep taproot system (up to 2 meters) recycles phosphorus and aerates subsoil. Breaks pest cycles for subsequent winter cereals.',
    incompatiblePredecessors: ['pigeonpeas'],
    favorablePredecessors: ['maize', 'cotton']
  },
  mothbeans: {
    id: 'mothbeans',
    name: 'Moth Beans (Matki)',
    scientificName: 'Vigna aconitifolia',
    family: 'Fabaceae',
    season: 'Kharif',
    durationDays: '60-75 days',
    waterRequirement: 'Low',
    feederType: 'Soil Builder',
    isLegume: true,
    nitrogenFixationKgPerHa: 35,
    idealRanges: {
      N: [0, 40], P: [35, 60], K: [15, 25],
      temperature: [24, 32], humidity: [40, 65], ph: [3.5, 10.0], rainfall: [30, 75]
    },
    rotationConsiderations: 'Extremely drought-resilient cover crop. Prevents soil erosion in arid conditions, suppresses weeds, and fixes atmospheric nitrogen.',
    incompatiblePredecessors: ['mothbeans'],
    favorablePredecessors: ['cotton', 'maize']
  },
  mungbean: {
    id: 'mungbean',
    name: 'Mung Bean (Green Gram)',
    scientificName: 'Vigna radiata',
    family: 'Fabaceae',
    season: 'Zaid',
    durationDays: '60-75 days',
    waterRequirement: 'Low',
    feederType: 'Soil Builder',
    isLegume: true,
    nitrogenFixationKgPerHa: 38,
    idealRanges: {
      N: [10, 40], P: [35, 60], K: [15, 25],
      temperature: [27, 30], humidity: [80, 90], ph: [6.2, 7.2], rainfall: [35, 60]
    },
    rotationConsiderations: 'Short-duration catch crop ideal for summer (Zaid) window between Rabi wheat and Kharif rice. Restores nitrogen rapidly.',
    incompatiblePredecessors: ['mungbean', 'blackgram'],
    favorablePredecessors: ['rice', 'wheat', 'maize']
  },
  blackgram: {
    id: 'blackgram',
    name: 'Black Gram (Urad)',
    scientificName: 'Vigna mungo',
    family: 'Fabaceae',
    season: 'Kharif',
    durationDays: '75-90 days',
    waterRequirement: 'Low',
    feederType: 'Soil Builder',
    isLegume: true,
    nitrogenFixationKgPerHa: 40,
    idealRanges: {
      N: [30, 60], P: [55, 80], K: [15, 25],
      temperature: [25, 35], humidity: [60, 70], ph: [6.5, 7.8], rainfall: [60, 75]
    },
    rotationConsiderations: 'Heavy foliage provides ground mulch, preventing moisture evaporation. Symbiotic nitrogen fixation improves succeeding cereal yield.',
    incompatiblePredecessors: ['blackgram', 'mungbean'],
    favorablePredecessors: ['rice', 'maize']
  },
  lentil: {
    id: 'lentil',
    name: 'Lentil (Masoor)',
    scientificName: 'Lens culinaris',
    family: 'Fabaceae',
    season: 'Rabi',
    durationDays: '100-130 days',
    waterRequirement: 'Low',
    feederType: 'Soil Builder',
    isLegume: true,
    nitrogenFixationKgPerHa: 36,
    idealRanges: {
      N: [10, 40], P: [55, 80], K: [15, 25],
      temperature: [18, 30], humidity: [60, 70], ph: [6.0, 7.5], rainfall: [35, 55]
    },
    rotationConsiderations: 'Thrives in residual moisture after monsoon rice harvesting. Excellent winter rotation crop with low water requirement.',
    incompatiblePredecessors: ['lentil', 'chickpea'],
    favorablePredecessors: ['rice', 'maize']
  },
  cotton: {
    id: 'cotton',
    name: 'Cotton',
    scientificName: 'Gossypium hirsutum',
    family: 'Malvaceae',
    season: 'Kharif',
    durationDays: '150-180 days',
    waterRequirement: 'Medium',
    feederType: 'Heavy Feeder',
    isLegume: false,
    idealRanges: {
      N: [100, 140], P: [35, 60], K: [15, 25],
      temperature: [22, 26], humidity: [75, 85], ph: [6.0, 8.0], rainfall: [60, 100]
    },
    rotationConsiderations: 'High nutrient consumer prone to Bollworm and Verticillium wilt. Requires strict non-Malvaceae rotation (pulses or cereals) to interrupt pest cycles.',
    incompatiblePredecessors: ['cotton', 'jute'],
    favorablePredecessors: ['chickpea', 'blackgram', 'pigeonpeas']
  },
  jute: {
    id: 'jute',
    name: 'Jute',
    scientificName: 'Corchorus olitorius',
    family: 'Malvaceae',
    season: 'Kharif',
    durationDays: '120-150 days',
    waterRequirement: 'High',
    feederType: 'Light Feeder',
    isLegume: false,
    idealRanges: {
      N: [60, 100], P: [35, 60], K: [35, 45],
      temperature: [23, 26], humidity: [70, 90], ph: [6.0, 7.5], rainfall: [150, 200]
    },
    rotationConsiderations: 'Sheds huge amount of leaves before harvesting, adding 3-4 tonnes/ha of organic matter. Excellent pre-paddy rotation crop.',
    incompatiblePredecessors: ['jute', 'cotton'],
    favorablePredecessors: ['lentil', 'chickpea']
  },
  watermelon: {
    id: 'watermelon',
    name: 'Watermelon',
    scientificName: 'Citrullus lanatus',
    family: 'Cucurbitaceae',
    season: 'Zaid',
    durationDays: '80-100 days',
    waterRequirement: 'Medium',
    feederType: 'Heavy Feeder',
    isLegume: false,
    idealRanges: {
      N: [80, 120], P: [10, 30], K: [45, 55],
      temperature: [24, 27], humidity: [80, 90], ph: [6.0, 7.0], rainfall: [40, 60]
    },
    rotationConsiderations: 'Susceptible to Fusarium wilt and root knot nematodes. Never plant consecutive Cucurbits in the same soil without a 2-3 season gap.',
    incompatiblePredecessors: ['watermelon', 'muskmelon'],
    favorablePredecessors: ['chickpea', 'lentil']
  },
  muskmelon: {
    id: 'muskmelon',
    name: 'Muskmelon',
    scientificName: 'Cucumis melo',
    family: 'Cucurbitaceae',
    season: 'Zaid',
    durationDays: '75-90 days',
    waterRequirement: 'Low',
    feederType: 'Heavy Feeder',
    isLegume: false,
    idealRanges: {
      N: [80, 120], P: [10, 30], K: [45, 55],
      temperature: [27, 30], humidity: [90, 95], ph: [6.0, 7.0], rainfall: [20, 30]
    },
    rotationConsiderations: 'Prefers warm, dry weather during ripening. Should be rotated with deep-rooted crops or legumes to suppress powdery mildew and soilborne fungi.',
    incompatiblePredecessors: ['muskmelon', 'watermelon'],
    favorablePredecessors: ['chickpea', 'blackgram']
  },
  pomegranate: {
    id: 'pomegranate',
    name: 'Pomegranate',
    scientificName: 'Punica granatum',
    family: 'Lythraceae',
    season: 'Perennial',
    durationDays: 'Perennial Orchard',
    waterRequirement: 'Low',
    feederType: 'Perennial Tree',
    isLegume: false,
    idealRanges: {
      N: [15, 45], P: [10, 30], K: [35, 45],
      temperature: [18, 25], humidity: [85, 95], ph: [5.5, 7.5], rainfall: [100, 115]
    },
    rotationConsiderations: 'Permanent horticultural orchard. Compatible with legume intercropping (Cowpea, Mung) between rows.',
    incompatiblePredecessors: [],
    favorablePredecessors: []
  },
  banana: {
    id: 'banana',
    name: 'Banana',
    scientificName: 'Musa acuminata',
    family: 'Musaceae',
    season: 'Perennial',
    durationDays: '10-12 months',
    waterRequirement: 'Very High',
    feederType: 'Heavy Feeder',
    isLegume: false,
    idealRanges: {
      N: [80, 120], P: [70, 95], K: [45, 55],
      temperature: [25, 30], humidity: [75, 85], ph: [5.5, 6.5], rainfall: [90, 120]
    },
    rotationConsiderations: 'Gross feeder of potassium and nitrogen. Usually grown in 1-2 ratoon cycles followed by sunn hemp or green manure to suppress Panama wilt.',
    incompatiblePredecessors: ['banana'],
    favorablePredecessors: ['mungbean']
  },
  mango: {
    id: 'mango',
    name: 'Mango',
    scientificName: 'Mangifera indica',
    family: 'Anacardiaceae',
    season: 'Perennial',
    durationDays: 'Perennial Tree',
    waterRequirement: 'Medium',
    feederType: 'Perennial Tree',
    isLegume: false,
    idealRanges: {
      N: [10, 30], P: [15, 35], K: [25, 35],
      temperature: [27, 36], humidity: [45, 55], ph: [4.5, 7.0], rainfall: [90, 105]
    },
    rotationConsiderations: 'Long-term fruit orchard crop (30+ years). In annual rotation planning, flags as perennial orchard.',
    incompatiblePredecessors: [],
    favorablePredecessors: []
  },
  grapes: {
    id: 'grapes',
    name: 'Grapes',
    scientificName: 'Vitis vinifera',
    family: 'Vitaceae',
    season: 'Perennial',
    durationDays: 'Perennial Vineyard',
    waterRequirement: 'Medium',
    feederType: 'Heavy Feeder',
    isLegume: false,
    idealRanges: {
      N: [10, 40], P: [120, 145], K: [195, 205],
      temperature: [10, 40], humidity: [80, 85], ph: [5.5, 7.0], rainfall: [65, 75]
    },
    rotationConsiderations: 'Permanent vineyard system with trellis infrastructure. Extremely high phosphorus and potassium demand in benchmark dataset.',
    incompatiblePredecessors: [],
    favorablePredecessors: []
  },
  apple: {
    id: 'apple',
    name: 'Apple',
    scientificName: 'Malus domestica',
    family: 'Rosaceae',
    season: 'Perennial',
    durationDays: 'Perennial Orchard',
    waterRequirement: 'Medium',
    feederType: 'Perennial Tree',
    isLegume: false,
    idealRanges: {
      N: [10, 40], P: [120, 145], K: [195, 205],
      temperature: [21, 24], humidity: [90, 95], ph: [5.5, 6.5], rainfall: [110, 125]
    },
    rotationConsiderations: 'Temperate deciduous fruit tree requiring winter chilling hours. Permanent orchard establishment.',
    incompatiblePredecessors: [],
    favorablePredecessors: []
  },
  orange: {
    id: 'orange',
    name: 'Orange',
    scientificName: 'Citrus sinensis',
    family: 'Rutaceae',
    season: 'Perennial',
    durationDays: 'Perennial Orchard',
    waterRequirement: 'Medium',
    feederType: 'Perennial Tree',
    isLegume: false,
    idealRanges: {
      N: [10, 40], P: [10, 30], K: [5, 15],
      temperature: [10, 35], humidity: [90, 95], ph: [6.0, 8.0], rainfall: [100, 120]
    },
    rotationConsiderations: 'Subtropical citrus orchard. Benefits from legume cover cropping between orchard rows to conserve soil moisture and fix nitrogen.',
    incompatiblePredecessors: [],
    favorablePredecessors: []
  },
  papaya: {
    id: 'papaya',
    name: 'Papaya',
    scientificName: 'Carica papaya',
    family: 'Caricaceae',
    season: 'Perennial',
    durationDays: '2-3 years',
    waterRequirement: 'Medium',
    feederType: 'Heavy Feeder',
    isLegume: false,
    idealRanges: {
      N: [30, 70], P: [45, 75], K: [45, 55],
      temperature: [23, 44], humidity: [90, 95], ph: [6.0, 7.0], rainfall: [140, 250]
    },
    rotationConsiderations: 'Semi-perennial herb. Highly susceptible to waterlogging and virus diseases. Follow with green manure pulses.',
    incompatiblePredecessors: ['papaya'],
    favorablePredecessors: ['mungbean', 'blackgram']
  },
  coconut: {
    id: 'coconut',
    name: 'Coconut',
    scientificName: 'Cocos nucifera',
    family: 'Arecaceae',
    season: 'Perennial',
    durationDays: 'Perennial Plantation',
    waterRequirement: 'High',
    feederType: 'Perennial Tree',
    isLegume: false,
    idealRanges: {
      N: [10, 40], P: [10, 30], K: [25, 35],
      temperature: [25, 29], humidity: [95, 100], ph: [5.0, 6.5], rainfall: [130, 225]
    },
    rotationConsiderations: 'Coastal plantation palm. Multi-tiered intercropping with banana, cocoa, and black pepper is common practice.',
    incompatiblePredecessors: [],
    favorablePredecessors: []
  },
  coffee: {
    id: 'coffee',
    name: 'Coffee',
    scientificName: 'Coffea arabica',
    family: 'Rubiaceae',
    season: 'Perennial',
    durationDays: 'Perennial Plantation',
    waterRequirement: 'High',
    feederType: 'Perennial Tree',
    isLegume: false,
    idealRanges: {
      N: [80, 120], P: [15, 35], K: [25, 35],
      temperature: [23, 28], humidity: [55, 70], ph: [6.0, 7.5], rainfall: [115, 200]
    },
    rotationConsiderations: 'Shade-loving hill plantation crop. Not rotated annually; managed in agroforestry ecosystems.',
    incompatiblePredecessors: [],
    favorablePredecessors: []
  }
};

export function getCropMetadata(cropName: string): CropMetadata | undefined {
  if (!cropName) return undefined;
  const key = cropName.trim().toLowerCase();
  return CROP_METADATA_REGISTRY[key];
}

export function getAnnualRotationCrops(): string[] {
  return Object.values(CROP_METADATA_REGISTRY)
    .filter(c => c.season !== 'Perennial' && c.feederType !== 'Perennial Tree')
    .map(c => c.id);
}
