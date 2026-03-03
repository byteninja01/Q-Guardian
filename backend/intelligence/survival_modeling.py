import math
import datetime
from typing import Dict, List, Any

class SurvivalModeler:
    """
    Computes real probability curves (Survival Functions) instead of arbitrary risk scores.
    Formula: S(t) = P(asset remains secure at time t)
    """
    
    def __init__(self):
        # Baseline median CRQC arrival year
        self.median_crqc_year = 2031
        
    def _compute_baseline_survival(self, current_year: float, target_year: float, variance: float = 2.0) -> float:
        """
        Uses a normal CDF to approximate the drop in survival probability around the CRQC arrival.
        """
        if current_year >= target_year + variance * 2:
            return 0.01
        
        # Z-score for the target year
        z = (target_year - current_year) / variance
        
        # Survival is basically the probability that CRQC *hasn't* arrived yet
        prob_safe = (1.0 + math.erf(z / math.sqrt(2.0))) / 2.0
        return float(prob_safe)
        
    def calculate_survival_curve(self, algorithm_strength: str, data_sensitivity: int, start_year: int = 2024, years_to_project: int = 15) -> List[Dict[str, Any]]:
        """
        Generates a time-series survival curve for a specific asset configuration.
        """
        curve = []
        
        # Adjust target CRQC arrival based on algorithm strength
        # E.g., RSA-2048 falls sooner than RSA-4096
        algo_modifier = {
            "RSA-2048": 0,
            "RSA-4096": +3,
            "ECDSA-P256": +1,
            "ECDSA-P384": +2,
            "ML-KEM-768": +100 # Quantum safe
        }.get(algorithm_strength, 0)
        
        effective_target_year = self.median_crqc_year + algo_modifier
        
        for year in range(start_year, start_year + years_to_project):
            # The survival probability drops over time
            prob = self._compute_baseline_survival(current_year=year, target_year=effective_target_year)
            
            # Incorporate Harvest-Now-Decrypt-Later (HNDL) exposure Window
            # If data is highly sensitive (e.g. 10 year retention), the "effective" survival drops earlier
            retention_penalty = (data_sensitivity / 10.0) * max(0, year - start_year) * 0.05
            prob = max(0.01, prob - retention_penalty)
            
            curve.append({
                "year": year,
                "survival_probability": round(prob * 100, 2),
                "is_critical": prob < 0.50
            })
            
        return curve
