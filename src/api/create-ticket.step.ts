import { ApiRouteConfig, Handlers } from "motia";
import { z } from "zod";
import crypto from "crypto";
import { EVENTS } from "../domain/ticket.constants";
import { TicketStatus } from "../domain/ticket.status";

export const config: ApiRouteConfig = {
  type: "api",
  name: "CreateTicket",
  description: "Create a new support ticket",
  path: "/tickets",
  method: "POST",
  emits: [EVENTS.TICKET_CREATED],
  flows: ["ticket-lifecycle"],
  bodySchema: z.object({
    userId: z.string(),
    description: z.string().min(10),
    proof: z
      .object({
        type: z.enum(["text", "image"]),
        value: z.string(),
      })
      .optional(),
  }),
};

export const handler: Handlers["CreateTicket"] = async (req, ctx) => {
  const ticketId = crypto.randomUUID();

  const ticket = {
    ticketId,
    userId: req.body.userId,
    description: req.body.description,
    proof: req.body.proof,
    status: TicketStatus.OPEN,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    attempts: 0,
  };

  await ctx.state.set("tickets", ticketId, ticket);

  await ctx.emit({
    topic: EVENTS.TICKET_CREATED,
    data: { ticketId },
  });

  ctx.logger.info("Ticket created", { ticketId });

  return {
    status: 201,
    body: { ticketId },
  };
};
