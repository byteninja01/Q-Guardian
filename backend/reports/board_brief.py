"""
Board Brief PDF Generator
Produces a one-page executive summary PDF using ReportLab.
"""
from io import BytesIO
from typing import List, Dict, Any

from reportlab.lib.pagesizes import letter
from reportlab.lib.colors import HexColor
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER


# Color palette matching our frontend theme
DARK_BG = HexColor("#09090b")
SURFACE = HexColor("#18181b")
PRIMARY = HexColor("#3b82f6")
ACCENT = HexColor("#f59e0b")
DANGER = HexColor("#ef4444")
TEXT_LIGHT = HexColor("#e4e4e7")
TEXT_DIM = HexColor("#a1a1aa")
WHITE = HexColor("#ffffff")


def _get_styles():
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        "BriefTitle",
        parent=styles["Title"],
        fontSize=22,
        textColor=WHITE,
        spaceAfter=6,
    ))
    styles.add(ParagraphStyle(
        "BriefSubtitle",
        parent=styles["Normal"],
        fontSize=11,
        textColor=TEXT_DIM,
        spaceAfter=20,
    ))
    styles.add(ParagraphStyle(
        "SectionHeader",
        parent=styles["Heading2"],
        fontSize=13,
        textColor=PRIMARY,
        spaceAfter=8,
        spaceBefore=16,
    ))
    styles.add(ParagraphStyle(
        "BodyText",
        parent=styles["Normal"],
        fontSize=10,
        textColor=TEXT_LIGHT,
        leading=14,
    ))
    styles.add(ParagraphStyle(
        "CriticalText",
        parent=styles["Normal"],
        fontSize=10,
        textColor=DANGER,
        leading=14,
    ))
    return styles


def generate_board_brief(
    summary: Dict[str, Any],
    top_targets: List[Dict[str, Any]],
    survival_horizon_years: float,
) -> bytes:
    """
    Generate a one-page Board Brief PDF.

    Args:
        summary: Portfolio summary stats dict (assets_scanned, quantum_debt_rate, etc.)
        top_targets: Top 3 harvest priority targets from red team
        survival_horizon_years: Median survival horizon in years

    Returns:
        PDF content as bytes
    """
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        topMargin=0.75 * inch,
        bottomMargin=0.5 * inch,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
    )

    styles = _get_styles()
    story = []

    # Title
    story.append(Paragraph("Q-Guardian 2.0 — Board Brief", styles["BriefTitle"]))
    story.append(Paragraph(
        "Quantum Risk Intelligence • Executive Summary",
        styles["BriefSubtitle"],
    ))

    # Portfolio Overview
    story.append(Paragraph("Portfolio Snapshot", styles["SectionHeader"]))
    overview_data = [
        ["Metric", "Value"],
        ["Assets Scanned", str(summary.get("assets_scanned", 0))],
        ["Quantum Debt Rate", f"+${summary.get('quantum_debt_rate', 0):,}/mo"],
        ["Debt Trend", summary.get("debt_trend", "N/A")],
        ["Median Survival Horizon", f"{survival_horizon_years} years"],
    ]
    overview_table = Table(overview_data, colWidths=[3 * inch, 3 * inch])
    overview_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), PRIMARY),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("BACKGROUND", (0, 1), (-1, -1), SURFACE),
        ("TEXTCOLOR", (0, 1), (-1, -1), TEXT_LIGHT),
        ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#3f3f46")),
        ("ALIGN", (1, 0), (1, -1), "RIGHT"),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
    ]))
    story.append(overview_table)

    # Top Harvest Targets
    story.append(Paragraph("Top Adversarial Harvest Targets", styles["SectionHeader"]))

    target_data = [["Rank", "Asset", "Priority", "Attacker ROI"]]
    for i, t in enumerate(top_targets[:3], 1):
        target_data.append([
            f"#{i}",
            t.get("hostname", "unknown"),
            t.get("target_priority", "MEDIUM"),
            str(t.get("roi_score", 0)),
        ])

    target_table = Table(target_data, colWidths=[0.6 * inch, 2.8 * inch, 1.2 * inch, 1.4 * inch])
    target_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), DANGER),
        ("TEXTCOLOR", (0, 0), (-1, 0), WHITE),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("BACKGROUND", (0, 1), (-1, -1), SURFACE),
        ("TEXTCOLOR", (0, 1), (-1, -1), TEXT_LIGHT),
        ("GRID", (0, 0), (-1, -1), 0.5, HexColor("#3f3f46")),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 10),
    ]))
    story.append(target_table)

    # Recommendations
    story.append(Paragraph("Recommended Immediate Actions", styles["SectionHeader"]))
    recommendations = [
        "1. Begin PQC migration assessment for all CRITICAL-priority assets within 90 days.",
        "2. Implement TLS 1.3 across all public-facing endpoints to reduce harvest surface.",
        "3. Conduct HNDL threat modeling for assets with sensitivity score ≥ 8.",
        "4. Establish a Cryptographic Agility roadmap aligned with NIST PQC standards.",
    ]
    for rec in recommendations:
        story.append(Paragraph(rec, styles["BodyText"]))
        story.append(Spacer(1, 4))

    # Disclaimer
    story.append(Spacer(1, 20))
    story.append(Paragraph(
        "This brief is auto-generated by Q-Guardian 2.0 Quantum Survival Intelligence. "
        "Survival probabilities are modeled under median CRQC arrival assumptions (2031) "
        "and should be validated against your organization's specific threat model.",
        styles["BodyText"],
    ))

    doc.build(story)
    return buffer.getvalue()
