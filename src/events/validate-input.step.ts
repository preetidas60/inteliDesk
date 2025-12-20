import { EventConfig, Handlers } from "motia";
import { z } from "zod";
import { EVENTS } from "../domain/ticket.constants";
import { TicketStatus } from "../domain/ticket.status";
import { TicketRepository } from "../repositories/ticket.repo";

export const config: EventConfig = {
  type: "event",
  name: "ValidateTicketInput",
  subscribes: [EVENTS.TICKET_CREATED],
  emits: [EVENTS.TICKET_VALIDATED],
  flows: ["ticket-lifecycle"],
  input: z.object({
    ticketId: z.string(),
  }),
};

export const handler: Handlers["ValidateTicketInput"] = async (input, ctx) => {
  const { ticketId } = input;

  const ticket = await TicketRepository.get(ctx, ticketId);
  if (!ticket) {
    ctx.logger.error("Ticket missing during validation", { ticketId });
    return;
  }

  // Duplication ticket (same description by same user)
  const allTickets = await ctx.state.getGroup<any>("tickets");
  const duplicate = allTickets.find(
    (t) =>
      t.ticketId !== ticketId &&
      t.userId === ticket.userId &&
      t.description === ticket.description
  );

  if (duplicate) {
    ctx.logger.warn("Duplicate ticket detected", {
      ticketId,
      duplicateOf: duplicate.ticketId,
    });
    return;
  }

  await TicketRepository.update(ctx, ticketId, {
    status: TicketStatus.VALIDATED,
  });

  await ctx.emit({
    topic: EVENTS.TICKET_VALIDATED,
    data: { ticketId },
  });

  ctx.logger.info("Ticket validated", { ticketId });
};
