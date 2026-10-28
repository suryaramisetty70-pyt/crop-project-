"""
Crop Rotation Optimization Engine
Optimizes multi-season crop sequences by combining ANN suitability probabilities
with agronomic constraints: botanical family alternation, legume nitrogen fixation,
seasonal calendar compliance, and pest lifecycle interruption.
"""

from typing import List, Dict, Any, Optional

CROP_PROPERTIES = {
    "rice": {"family": "Poaceae", "season": "Kharif", "is_legume": False, "feeder": "Heavy", "water": "High"},
    "maize": {"family": "Poaceae", "season": "Kharif", "is_legume": False, "feeder": "Heavy", "water": "Medium"},
    "chickpea": {"family": "Fabaceae", "season": "Rabi", "is_legume": True, "feeder": "Builder", "water": "Low", "n_fix": 42},
    "kidneybeans": {"family": "Fabaceae", "season": "Rabi", "is_legume": True, "feeder": "Builder", "water": "Medium", "n_fix": 30},
    "pigeonpeas": {"family": "Fabaceae", "season": "Kharif", "is_legume": True, "feeder": "Builder", "water": "Medium", "n_fix": 50},
    "mothbeans": {"family": "Fabaceae", "season": "Kharif", "is_legume": True, "feeder": "Builder", "water": "Low", "n_fix": 35},
    "mungbean": {"family": "Fabaceae", "season": "Zaid", "is_legume": True, "feeder": "Builder", "water": "Low", "n_fix": 38},
    "blackgram": {"family": "Fabaceae", "season": "Kharif", "is_legume": True, "feeder": "Builder", "water": "Low", "n_fix": 40},
    "lentil": {"family": "Fabaceae", "season": "Rabi", "is_legume": True, "feeder": "Builder", "water": "Low", "n_fix": 36},
    "cotton": {"family": "Malvaceae", "season": "Kharif", "is_legume": False, "feeder": "Heavy", "water": "Medium"},
    "jute": {"family": "Malvaceae", "season": "Kharif", "is_legume": False, "feeder": "Light", "water": "High"},
    "watermelon": {"family": "Cucurbitaceae", "season": "Zaid", "is_legume": False, "feeder": "Heavy", "water": "Medium"},
    "muskmelon": {"family": "Cucurbitaceae", "season": "Zaid", "is_legume": False, "feeder": "Heavy", "water": "Low"},
}

SEASONS = ["Kharif", "Rabi", "Zaid"]

class RotationOptimizer:
    def __init__(self, ann_predictions: List[Dict[str, Any]]):
        self.ann_scores = {p["crop"]: p["probability"] for p in ann_predictions}

    def plan_sequence(
        self,
        seasons_count: int = 4,
        start_season: str = "Kharif",
        previous_crop: Optional[str] = None,
        soil_nitrogen: float = 60.0
    ) -> Dict[str, Any]:
        """
        Plans an optimal multi-season rotation sequence.
        """
        start_idx = SEASONS.index(start_season) if start_season in SEASONS else 0
        sequence = []
        prev_crop = (previous_crop or "").strip().lower()
        prev_family = CROP_PROPERTIES.get(prev_crop, {}).get("family", "None")
        current_n = soil_nitrogen

        for s in range(seasons_count):
            season_name = SEASONS[(start_idx + s) % len(SEASONS)]
            
            # Eligible annual crops for this season
            candidates = [
                c for c, props in CROP_PROPERTIES.items()
                if props["season"] == season_name or (season_name == "Kharif" and c in ["mothbeans", "blackgram"]) or (season_name == "Rabi" and c in ["maize"])
            ]

            scored_candidates = []
            for crop in candidates:
                props = CROP_PROPERTIES[crop]
                ann_p = self.ann_scores.get(crop, 0.05)
                score = ann_p * 0.45

                bonuses = []
                penalties = []

                # Rule 1: Monoculture penalty
                if crop == prev_crop:
                    score -= 0.60
                    penalties.append("Monoculture penalty: consecutive planting degrades soil.")

                # Rule 2: Family alternation
                if props["family"] == prev_family and prev_family != "None":
                    score -= 0.35
                    penalties.append(f"Family repetition ({props['family']}): promotes soil pathogens.")
                elif prev_family != "None":
                    score += 0.20
                    bonuses.append(f"Family alternation ({prev_family} -> {props['family']}): interrupts insect pupation.")

                # Rule 3: Legume nitrogen fixation
                if props.get("is_legume", False):
                    fix = props.get("n_fix", 35)
                    if current_n < 50:
                        score += 0.30
                        bonuses.append(f"Recharges nitrogen deficient soil (+{fix} kg/ha).")
                    else:
                        score += 0.15
                        bonuses.append(f"Fixes atmospheric nitrogen (+{fix} kg/ha).")

                scored_candidates.append({
                    "crop": crop,
                    "score": score,
                    "ann_suitability": ann_p,
                    "bonuses": bonuses,
                    "penalties": penalties,
                    "props": props
                })

            scored_candidates.sort(key=lambda x: x["score"], reverse=True)
            chosen = scored_candidates[0]

            # Update soil N state
            if chosen["props"].get("is_legume", False):
                n_change = f"+{chosen['props'].get('n_fix', 35)} kg/ha (Rhizobium)"
                current_n += chosen["props"].get("n_fix", 35)
            elif chosen["props"]["feeder"] == "Heavy":
                n_change = "-25 kg/ha"
                current_n = max(10, current_n - 25)
            else:
                n_change = "-10 kg/ha"
                current_n = max(10, current_n - 10)

            sequence.append({
                "season_number": s + 1,
                "season": season_name,
                "crop": chosen["crop"],
                "family": chosen["props"]["family"],
                "ann_suitability": round(chosen["ann_suitability"] * 100, 2),
                "rotation_score": round(max(0.1, min(1.0, chosen["score"] + 0.3)) * 100, 2),
                "nitrogen_impact": n_change,
                "rationale": " ".join(chosen["bonuses"]) or f"Optimal fit for {season_name}."
            })

            prev_crop = chosen["crop"]
            prev_family = chosen["props"]["family"]

        return {
            "seasons_planned": seasons_count,
            "starting_season": start_season,
            "sequence": sequence,
            "comparison_with_monoculture": {
                "monoculture_risk": "Continuous single-crop cultivation depletes specific soil horizons and increases weed competition.",
                "rotation_advantage": "Systematic pulse-cereal alternation replenishes nitrogen, balances root depths, and enhances microbial biodiversity."
            }
        }
