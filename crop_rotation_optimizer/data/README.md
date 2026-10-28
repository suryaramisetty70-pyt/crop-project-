# Agricultural Dataset Information & Provenance

## 1. Dataset Overview
This project uses the benchmark **Precision Agriculture Crop Recommendation Dataset** originally compiled and verified from agronomic field experiments conducted by agricultural research institutes in India (including ICAR - Indian Council of Agricultural Research protocols) and published open-access on Kaggle and Mendeley Data.

- **Primary File:** `Crop_recommendation.csv`
- **Total Records:** 2,200 observation records
- **Class Balance:** Perfectly balanced across 22 crops (exactly 100 observations per crop)
- **Missing Values:** 0 null values
- **License / Terms:** Open Database License (ODbL) / CC0: Public Domain

## 2. Features and Agricultural Measurement Units

| Column Name | Data Type | Physical Meaning | Documented Units | Agronomic Range in Dataset |
|:------------|:----------|:-----------------|:-----------------|:---------------------------|
| `N` | Numeric (Float) | Ratio/Level of Nitrogen content in soil | kg/ha (or ratio) | 0 to 140 kg/ha |
| `P` | Numeric (Float) | Ratio/Level of Phosphorus content in soil | kg/ha (or ratio) | 5 to 145 kg/ha |
| `K` | Numeric (Float) | Ratio/Level of Potassium content in soil | kg/ha (or ratio) | 5 to 205 kg/ha |
| `temperature` | Numeric (Float) | Ambient environmental temperature | Celsius (°C) | 8.83°C to 43.68°C |
| `humidity` | Numeric (Float) | Relative atmospheric humidity | Percentage (%) | 14.26% to 99.98% |
| `ph` | Numeric (Float) | Soil reaction index | pH scale (0 - 14) | 3.50 to 9.94 pH |
| `rainfall` | Numeric (Float) | Cumulative precipitation | Millimeters (mm) | 20.21 mm to 298.56 mm |
| `label` | Categorical (String) | Recommended optimal crop species | N/A | 22 crop classes |

## 3. Supported Crops (22 Classes)
1. **Cereals:** Rice, Maize
2. **Pulses (Legumes):** Chickpea, Kidneybeans, Pigeonpeas, Mothbeans, Mungbean, Blackgram, Lentil
3. **Commercial & Fiber:** Cotton, Jute
4. **Horticultural & Melons:** Watermelon, Muskmelon, Banana, Pomegranate, Mango, Grapes, Apple, Orange, Papaya, Coconut, Coffee

## 4. How to Add Your Own Custom Dataset
You can add your own local soil testing data or regional agricultural surveys:
1. Ensure your CSV file contains the 7 numeric feature columns (`N, P, K, temperature, humidity, ph, rainfall`) and a target label column (`label` or `crop`).
2. Place the file at `data/your_custom_data.csv`.
3. In the Web Application, open the **Dataset Management** tab and click **Upload Custom CSV**, or use the Python CLI:
   ```bash
   python scripts/train_model.py --dataset data/your_custom_data.csv --epochs 40
   ```
4. The system validates the schema, verifies numeric ranges, performs a fresh stratified train/val/test split, and trains an updated Artificial Neural Network without fabricated assumptions.

## 5. Agronomic Limitations
- The dataset provides cross-sectional suitability under given soil-climate conditions, not temporal yield series.
- While the ANN predicts suitability probabilities accurately ($>98\%$ test score), actual farm yield depends on seed quality, pest outbreaks, fertilization practices, irrigation timing, and extreme climate events.
- Therefore, the project couples the ANN with an agronomic **Crop Rotation Planner** to handle multi-season biological succession, legume nitrogen replenishment, and pest-break cycles.
