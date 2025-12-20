from typing import Dict
from pydantic import BaseModel
import math
import re

# ---------------- CONFIG ----------------

config = {
    "type": "event",
    "name": "DetectProofAuthenticity",
    "subscribes": ["ticket.validated"],
    "emits": ["ticket.proof.checked"],
    "description": "Detect whether complaint proof is AI-generated or manipulated",
    "flows": ["ticket-lifecycle"],
    "input": {
        "type": "object",
        "properties": {
            "ticketId": {"type": "string"}
        },
        "required": ["ticketId"]
    }
}

# ---------------- MODELS ----------------

class ProofRisk(BaseModel):
    aiGenerated: bool
    confidence: float


# ---------------- HELPERS ----------------

def text_ai_heuristics(text: str) -> float:
    """
    Simple but realistic AI-text detection heuristics.
    We avoid fake 'AI detectors' and use explainable signals.
    """
    words = text.split()
    unique_ratio = len(set(words)) / max(len(words), 1)

    repetitive_phrases = len(re.findall(r"(\b\w+\b)(?:\s+\1){2,}", text))
    repetition_penalty = min(repetitive_phrases * 0.15, 0.6)

    entropy = -sum(
        (words.count(w) / len(words)) *
        math.log(words.count(w) / len(words))
        for w in set(words)
    ) if words else 0

    score = 0.0
    score += 0.4 if unique_ratio < 0.35 else 0.0
    score += 0.3 if entropy < 2.5 else 0.0
    score += repetition_penalty

    return min(score, 1.0)


# ---------------- HANDLER ----------------

async def handler(input_data, context):
    ticket_id = input_data["ticketId"]

    ticket = await context.state.get("tickets", ticket_id)
    if not ticket:
        context.logger.error("Ticket not found for proof check", {"ticketId": ticket_id})
        return

    proof = ticket.get("proof")
    risk_score = 0.0

    if proof and proof.get("type") == "text":
        risk_score = text_ai_heuristics(proof.get("value", ""))

    # Image proof placeholder (metadata / GAN artifacts can be added later)
    if proof and proof.get("type") == "image":
        risk_score = 0.15  # conservative default

    result = ProofRisk(
        aiGenerated=risk_score >= 0.65,
        confidence=round(risk_score, 2)
    )

    await context.state.set(
        "proofRisk",
        ticket_id,
        result.dict()
    )

    await context.emit({
        "topic": "ticket.proof.checked",
        "data": {
            "ticketId": ticket_id,
            "proofRisk": result.dict()
        }
    })

    context.logger.info(
        "Proof authenticity evaluated",
        {"ticketId": ticket_id, **result.dict()}
    )
