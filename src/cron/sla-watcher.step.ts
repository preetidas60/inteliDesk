import { CronConfig } from "motia";
import { SLA_HOURS, EVENTS } from "../domain/ticket.constants";
import { TicketStatus } from "../domain/ticket.status";

export const config: CronConfig = {
  type: "cron",
  name: "SLAWatcher",
  cron: "*/10 * * * *", // every 10 minutes
  flows: ["ticket-lifecycle"],
  emits: [EVENTS.ESCALATE],
};

export const handler = async (_event: unknown, ctx: any) => {
  const tickets = await ctx.state.getGroup("tickets");
  const now = Date.now();

  for (const ticket of tickets) {
    if (
      ticket.status === TicketStatus.RESOLVED ||
      ticket.status === TicketStatus.OPEN
    ) {
      continue;
    }

    const ageHours = (now - ticket.createdAt) / (1000 * 60 * 60);

    if (ageHours >= SLA_HOURS) {
      ctx.logger.warn("SLA breached", { ticketId: ticket.ticketId });

      await ctx.emit({
        topic: EVENTS.ESCALATE,
        data: { ticketId: ticket.ticketId },
      });
    }
  }
};
