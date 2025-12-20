import { EventConfig, Handlers } from "motia";
import { z } from "zod";
import { EVENTS } from "../domain/ticket.constants";
import { TicketRepository } from "../repositories/ticket.repo";
import { TicketStatus } from "../domain/ticket.status";

export const config: EventConfig = {
  type: "event",
  name: "RouteDecision",
  subscribes: [EVENTS.INTENT_CLASSIFIED],
  emits: [
    { topic: EVENTS.AUTO_RESOLVE, label: "Safe → Auto Resolve" },
    { topic: EVENTS.ESCALATE, label: "Risky → Human Escalation" },
  ],
  flows: ["ticket-lifecycle"],
  input: z.object({
    ticketId: z.string(),
    intent: z.string(),
    confidence: z.number(),
    proofRisk: z.object({
      aiGenerated: z.boolean(),
      confidence: z.number(),
    }),
  }),
};

export const handler: Handlers["RouteDecision"] = async (input, ctx) => {
  const { ticketId, confidence, proofRisk } = input;

  const ticket = await TicketRepository.get(ctx, ticketId);
  if (!ticket) return;

  const shouldEscalate =
    proofRisk.aiGenerated === true ||
    proofRisk.confidence > 0.85 ||
    confidence < 0.7;

  if (shouldEscalate) {
    await TicketRepository.update(ctx, ticketId, {
      status: TicketStatus.ESCALATED,
    });

    await ctx.emit({
      topic: EVENTS.ESCALATE,
      data: { ticketId },
    });

    ctx.logger.info("Ticket escalated to human", { ticketId });
  } else {
    await TicketRepository.update(ctx, ticketId, {
      status: TicketStatus.AUTO_RESOLVING,
    });

    await ctx.emit({
      topic: EVENTS.AUTO_RESOLVE,
      data: { ticketId },
    });

    ctx.logger.info("Ticket routed to auto resolve", { ticketId });
  }
};
