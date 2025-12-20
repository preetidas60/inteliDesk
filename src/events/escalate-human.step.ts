import { EventConfig, Handlers } from "motia";
import { z } from "zod";
import { TicketRepository } from "../repositories/ticket.repo";
import { TicketStatus } from "../domain/ticket.status";

export const config: EventConfig = {
  type: "event",
  name: "EscalateToHuman",
  subscribes: ["ticket.escalate"],
  emits: [],
  flows: ["ticket-lifecycle"],
  input: z.object({
    ticketId: z.string(),
  }),
};

export const handler: Handlers["EscalateToHuman"] = async (input, ctx) => {
  const { ticketId } = input;

  const ticket = await TicketRepository.get(ctx, ticketId);
  if (!ticket) return;

  await TicketRepository.update(ctx, ticketId, {
    status: TicketStatus.ESCALATED,
  });

  // Stream update for agent dashboard
  await ctx.stream.publish("ticket-updates", {
    ticketId,
    status: TicketStatus.ESCALATED,
    message: "Ticket escalated to human agent",
  });

  ctx.logger.info("Ticket escalated to human", { ticketId });
};
