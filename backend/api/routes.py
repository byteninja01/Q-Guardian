from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from io import BytesIO
import datetime

from intelligence.survival_modeling import SurvivalModeler
from intelligence.red_team_simulator import RedTeamSimulator
from intelligence.complexity_model import MigrationComplexityModel
from intelligence.narrative_generator import RiskNarrativeGenerator
from data.mock_data import MOCK_CBOM
from data.crtsh_client import CrtshClient
from data.ssllabs_client import SSLLabsClient
from intelligence.semantic_classifier import SemanticAssetClassifier
from reports.board_brief import generate_board_brief

router = APIRouter()
survival_modeler = SurvivalModeler()
red_team = RedTeamSimulator()
complexity_model = MigrationComplexityModel()
narrator = RiskNarrativeGenerator()
crtsh = CrtshClient()
ssllabs = SSLLabsClient()
classifier = SemanticAssetClassifier()


# ── Request models ──────────────────────────────────────

class ScenarioRequest(BaseModel):
    crqc_year: int = 2031
    migration_start_year: int = 2026


# ── Existing endpoints ──────────────────────────────────

@router.get("/portfolio/summary")
def get_portfolio_summary():
    """
    High-level stats for the dashboard header.
    """
    return {
        "assets_scanned": len(MOCK_CBOM),
        "quantum_debt_rate": 42500,
        "debt_trend": "+12%",
        "median_survival_horizon": 4.2
    }


@router.get("/portfolio/cbom")
async def get_cbom():
    """
    Returns the Cryptographic Bill of Materials enriched with Red Team priority,
    migration complexity, and semantic classification.
    """
    prioritized = red_team.generate_harvest_priority(MOCK_CBOM)
    complexities = complexity_model.predict_batch(MOCK_CBOM)

    # Build a lookup for complexity by hostname
    complexity_lookup = {c["hostname"]: c for c in complexities}

    enriched_cbom = []
    for prio in prioritized:
        orig = next((item for item in MOCK_CBOM if item["hostname"] == prio["hostname"]), None)
        if orig:
            merged = {**orig, **prio}

            # 1. Semantic Classification (Dynamic or Fallback)
            semantic = classifier.classify_asset(orig["hostname"], {})
            merged["semantic_classification"] = semantic["semantic_classification"]
            merged["semantic_sensitivity_score"] = semantic["semantic_sensitivity_score"]

            # 2. Survival curve
            curve = survival_modeler.calculate_survival_curve(
                algorithm_strength=orig.get("algorithm_strength", "RSA-2048"),
                data_sensitivity=merged["semantic_sensitivity_score"]
            )
            merged["survival_curve"] = curve

            # 3. Migration complexity
            comp = complexity_lookup.get(orig["hostname"], {})
            merged["complexity_level"] = comp.get("complexity_level", "MEDIUM")
            merged["complexity_score"] = comp.get("complexity_score", 50)

            enriched_cbom.append(merged)

    return {"data": enriched_cbom}


@router.get("/portfolio/scan/{hostname}")
async def scan_asset(hostname: str):
    """
    Triggers a live SSLLabs scan for the given host.
    """
    results = await ssllabs.analyze(hostname)
    return results


# ── New endpoints ───────────────────────────────────────

@router.post("/portfolio/scenario")
def run_scenario(scenario: ScenarioRequest):
    """
    Recalculate survival curves under a custom CRQC arrival / migration scenario.
    """
    # Override the modeler's target year
    original_target = survival_modeler.median_crqc_year
    survival_modeler.median_crqc_year = scenario.crqc_year

    results = []
    for asset in MOCK_CBOM:
        curve = survival_modeler.calculate_survival_curve(
            algorithm_strength=asset.get("algorithm_strength", "RSA-2048"),
            data_sensitivity=asset.get("semantic_sensitivity_score", 5),
            start_year=scenario.migration_start_year,
        )
        results.append({
            "hostname": asset["hostname"],
            "survival_curve": curve,
            "scenario": {
                "crqc_year": scenario.crqc_year,
                "migration_start_year": scenario.migration_start_year,
            }
        })

    # Restore
    survival_modeler.median_crqc_year = original_target
    return {"data": results}


@router.get("/portfolio/narrative/{hostname}")
def get_narrative(hostname: str):
    """
    Returns the LLM-generated risk narrative for a specific asset.
    """
    asset = next((a for a in MOCK_CBOM if a["hostname"] == hostname), None)
    if not asset:
        raise HTTPException(status_code=404, detail=f"Asset '{hostname}' not found")

    # Enrich with red team data
    prioritized = red_team.generate_harvest_priority([asset])
    enriched = {**asset, **(prioritized[0] if prioritized else {})}

    # Generate narrative
    survival = survival_modeler.calculate_survival_curve(
        algorithm_strength=asset.get("algorithm_strength", "RSA-2048"),
        data_sensitivity=asset.get("semantic_sensitivity_score", 5)
    )

    narrative = narrator.generate_narrative(enriched, {"curve": survival})

    # Complexity
    comp = complexity_model.predict_complexity(asset)

    return {
        "hostname": hostname,
        "narrative": narrative,
        "complexity": comp,
    }


@router.get("/portfolio/cbom/{hostname}/certlogs")
async def get_cert_logs(hostname: str):
    """
    Returns Certificate Transparency log entries for a hostname.
    """
    domain = ".".join(hostname.split(".")[-2:]) if "." in hostname else hostname
    logs = await crtsh.get_certificates(domain)
    return {"hostname": hostname, "domain": domain, "certificates": logs}


@router.get("/reports/board-brief")
def download_board_brief():
    """
    Generates and streams a PDF Board Brief.
    """
    summary = {
        "assets_scanned": len(MOCK_CBOM),
        "quantum_debt_rate": 42500,
        "debt_trend": "+12%",
    }

    top_targets = red_team.generate_harvest_priority(MOCK_CBOM)[:3]

    pdf_bytes = generate_board_brief(
        summary=summary,
        top_targets=top_targets,
        survival_horizon_years=4.2,
    )

    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=Q-Guardian_Board_Brief.pdf"
        }
    )
