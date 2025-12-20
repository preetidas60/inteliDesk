import { EventConfig, Handlers } from "motia";
import { z } from "zod";
import { TicketRepository } from "../repositories/ticket.repo";
import { TicketStatus } from "../domain/ticket.status";
import { EVENTS } from "../domain/ticket.constants";

export const config: EventConfig = {
  type: "event",
  name: "FinalizeTicket",
  subscribes: [EVENTS.RESOLVED],
  flows: ["ticket-lifecycle"],
  input: z.object({
    ticketId: z.string(),
  }),
};

export const handler: Handlers["FinalizeTicket"] = async (input, ctx) => {
  const { ticketId } = input;

  const ticket = await TicketRepository.get(ctx, ticketId);
  if (!ticket) return;

  await TicketRepository.update(ctx, ticketId, {
    status: TicketStatus.RESOLVED,
  });

  await ctx.stream.publish("ticket-updates", {
    ticketId,
    status: TicketStatus.RESOLVED,
    message: "Ticket resolved successfully",
  });

  ctx.logger.info("Ticket finalized", { ticketId });
};
