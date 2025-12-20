from typing import Dict
from pydantic import BaseModel

# ---------------- CONFIG ----------------

config = {
    "type": "event",
    "name": "ClassifyIntent",
    "subscribes": ["ticket.proof.checked"],
    "emits": ["ticket.intent.classified"],
    "description": "Classify complaint intent and urgency",
    "flows": ["ticket-lifecycle"],
    "input": {
        "type": "object",
        "properties": {
            "ticketId": {"type": "string"},
            "proofRisk": {"type": "object"}
        },
        "required": ["ticketId", "proofRisk"]
    }
}

# ---------------- MODELS ----------------

class IntentResult(BaseModel):
    intent: str
    confidence: float


# ---------------- HANDLER ----------------

async def handler(input_data, context):
    ticket_id = input_data["ticketId"]

    ticket = await context.state.get("tickets", ticket_id)
    if not ticket:
        context.logger.error("Ticket not found for intent classification", {"ticketId": ticket_id})
        return

    description = ticket.get("description", "").lower()

    intent = "general"
    confidence = 0.6

    if "refund" in description or "charged" in description:
        intent = "billing_refund"
        confidence = 0.85
    elif "login" in description or "password" in description:
        intent = "auth_issue"
        confidence = 0.8
    elif "delivery" in description or "order" in description:
        intent = "order_issue"
        confidence = 0.75

    await context.emit({
        "topic": "ticket.intent.classified",
        "data": {
            "ticketId": ticket_id,
            "intent": intent,
            "confidence": confidence,
            "proofRisk": input_data["proofRisk"]
        }
    })

    context.logger.info(
        "Intent classified",
        {"ticketId": ticket_id, "intent": intent, "confidence": confidence}
    )
