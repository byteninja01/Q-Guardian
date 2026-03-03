"""
Migration Complexity Model
Predicts PQC migration difficulty based on TLS signals.
"""
from typing import Dict, Any


class MigrationComplexityModel:
    """
    Estimates how difficult (Low / Medium / High) it will be to migrate
    a given asset from classical to post-quantum cryptography.

    Features considered:
    - Algorithm family & key size
    - TLS version
    - Number of dependent services (estimated from migration months)
    - Cipher suite diversity
    """

    # Algorithm family risk weights (higher = harder to migrate)
    ALGO_WEIGHTS = {
        "RSA-2048": 0.6,
        "RSA-4096": 0.5,
        "ECDSA-P256": 0.4,
        "ECDSA-P384": 0.35,
        "ML-KEM-768": 0.05,  # Already PQC-ready
    }

    # TLS version risk (older = more entangled legacy systems)
    TLS_WEIGHTS = {
        "TLS 1.0": 0.9,
        "TLS 1.1": 0.75,
        "TLS 1.2": 0.5,
        "TLS 1.3": 0.3,
    }

    def predict_complexity(self, asset: Dict[str, Any]) -> Dict[str, Any]:
        """
        Returns a complexity assessment for a single asset.
        """
        algo = asset.get("algorithm_strength", "RSA-2048")
        tls = asset.get("tls_version", "TLS 1.2")
        migration_months = asset.get("estimated_migration_months", 12)

        # Feature engineering
        algo_score = self.ALGO_WEIGHTS.get(algo, 0.5)
        tls_score = self.TLS_WEIGHTS.get(tls, 0.5)
        timeline_score = min(migration_months / 36.0, 1.0)  # Normalize to 0-1

        # Weighted combination
        composite = (algo_score * 0.3) + (tls_score * 0.3) + (timeline_score * 0.4)

        # Classify
        if composite >= 0.65:
            level = "HIGH"
            rationale = "Legacy protocol stack and extended migration timeline create significant dependency risk."
        elif composite >= 0.40:
            level = "MEDIUM"
            rationale = "Moderate migration complexity — standard PQC transition planning applies."
        else:
            level = "LOW"
            rationale = "Modern protocol stack with manageable migration scope."

        return {
            "hostname": asset.get("hostname", "unknown"),
            "complexity_level": level,
            "complexity_score": round(composite * 100, 1),
            "rationale": rationale,
            "contributing_factors": {
                "algorithm_risk": round(algo_score * 100, 1),
                "protocol_risk": round(tls_score * 100, 1),
                "timeline_risk": round(timeline_score * 100, 1),
            },
        }

    def predict_batch(self, assets: list) -> list:
        """Predict complexity for a batch of assets."""
        return [self.predict_complexity(asset) for asset in assets]
