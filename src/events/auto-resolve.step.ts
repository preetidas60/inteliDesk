import { EventConfig, Handlers } from "motia";
import { z } from "zod";
import { EVENTS, MAX_AUTO_RESOLVE_ATTEMPTS } from "../domain/ticket.constants";
import { TicketRepository } from "../repositories/ticket.repo";
import { TicketStatus } from "../domain/ticket.status";

export const config: EventConfig = {
  type: "event",
  name: "AutoResolveTicket",
  subscribes: [EVENTS.AUTO_RESOLVE],
  emits: [],
  flows: ["ticket-lifecycle"],
  input: z.object({
    ticketId: z.string(),
  }),
};

export const handler: Handlers["AutoResolveTicket"] = async (input, ctx) => {
  const { ticketId } = input;

  const ticket = await TicketRepository.get(ctx, ticketId);
  if (!ticket) return;

  if (ticket.attempts >= MAX_AUTO_RESOLVE_ATTEMPTS) {
    await ctx.emit({
      topic: EVENTS.ESCALATE,
      data: { ticketId },
    });
    return;
  }

  // Simulated resolution logic
  await TicketRepository.update(ctx, ticketId, {
    attempts: ticket.attempts + 1,
    status: TicketStatus.WAITING_FOR_USER,
  });

  ctx.logger.info("Auto response sent to user", {
    ticketId,
    attempt: ticket.attempts + 1,
  });
};
