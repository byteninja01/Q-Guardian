import openai
import os
from typing import Dict, Any

class SemanticAssetClassifier:
    """
    Reads the context around each endpoint (subdomain, HTTP headers, etc.)
    and classifies the asset semantically (e.g. 'payments-api', 'vpn').
    """
    
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY", "")
        # fallback dictionary for demo mode or if no API key is set
        self.fallback_classification = {
            "payments-api": {"classification": "High-sensitivity financial transaction endpoint", "score": 9},
            "vpn": {"classification": "Credential and session gateway", "score": 9},
            "research-portal": {"classification": "Long-lived sensitive data repository", "score": 8},
            "www": {"classification": "Public marketing page", "score": 2}
        }
        
    def classify_asset(self, hostname: str, tls_data: dict, http_headers: dict = {}) -> Dict[str, Any]:
        """
        Classify the asset. In a real scenario, this uses an LLM to read the subdomain
        and any public API docs/headers to infer the asset's purpose.
        """
        
        # If no API key, use heuristics for the demo
        term = hostname.split('.')[0].lower()
        
        for key, val in self.fallback_classification.items():
            if key in term:
                return {
                    "hostname": hostname,
                    "semantic_classification": val["classification"],
                    "semantic_sensitivity_score": val["score"]
                }
                
        # Default
        return {
            "hostname": hostname,
            "semantic_classification": "General purpose web server",
            "semantic_sensitivity_score": 4
        }
