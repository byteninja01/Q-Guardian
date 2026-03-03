import random
from typing import List, Dict, Any

class RedTeamSimulator:
    """
    Simulates a nation-state adversary's selection of harvest targets.
    Instead of arbitrary risk, ranks assets by pure "Attacker ROI".
    """
    
    def __init__(self):
        pass
        
    def generate_harvest_priority(self, cbom_assets: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Calculates Attacker ROI = (Data Value * Interceptability) / Migration Speed
        """
        prioritized = []
        for asset in cbom_assets:
            # 1. Data Value (1-10) based on semantic classification
            # e.g., VPN -> 9, Payment API -> 8, Marketing -> 2
            data_val = asset.get('semantic_sensitivity_score', 5)
            
            # 2. Interceptability (1-10) 
            # e.g., public facing = 9, internal = 4
            intercept = asset.get('interceptability_score', 7)
            
            # 3. Time until migrated (estimated months)
            # Longer time = better for attacker to set up harvest
            migration_timeline = asset.get('estimated_migration_months', 12)
            
            # Attacker ROI (Higher is better for attacker)
            roi = (data_val * intercept) * (migration_timeline / 12.0)
            
            prioritized.append({
                "hostname": asset.get("hostname"),
                "roi_score": round(roi, 1),
                "harvest_recommendation": self._generate_attacker_rationale(data_val, intercept, migration_timeline),
                "target_priority": "CRITICAL" if roi > 60 else "HIGH" if roi > 40 else "MEDIUM"
            })
            
        # Sort descending by ROI
        return sorted(prioritized, key=lambda x: x["roi_score"], reverse=True)
        
    def _generate_attacker_rationale(self, val: int, intercept: int, timeline: int) -> str:
        if val > 8 and timeline > 18:
            return "High-value long-term data repository with slow migration cadence. Ideal ongoing tap target."
        elif intercept > 8:
            return "Highly exposed endpoint, trivial to intercept. Harvest aggressively before migration."
        else:
            return "Opportunistic harvest target."
