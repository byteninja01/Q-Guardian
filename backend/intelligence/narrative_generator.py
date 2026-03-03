class RiskNarrativeGenerator:
    """
    Generates a localized Quantum Risk Narrative via LLM.
    """
    def __init__(self):
        pass
        
    def generate_narrative(self, asset_data: dict, survival_data: dict) -> str:
        """
        Produce a tailored narrative that explains the risk in business terms.
        """
        hostname = asset_data.get('hostname', 'unknown')
        classification = asset_data.get('semantic_classification', 'system')
        algo = asset_data.get('algorithm_strength', 'legacy cryptography')
        urgency = asset_data.get('target_priority', 'MEDIUM')
        
        # In a real app we'd call an LLM. Here is a mocked but robust generation for the demo:
        return f"Your {classification} ({hostname}) uses {algo}. Under median CRQC timeline assumptions (2031), adversaries conducting harvest-now-decrypt-later attacks beginning today would be able to decrypt intercepted records with a confidence-weighted exposure window opening in approximately 26 months. This asset is ranked {urgency} urgency because the risk-to-effort ratio makes this a high-return migration target."
