import { Ticket } from "../domain/ticket.types";

interface TicketContext {
  state: {
    get<T>(namespace: string, key: string): Promise<T | null>;
    set(namespace: string, key: string, value: any): Promise<void>;
  };
}

export class TicketRepository {
  static async get(
    ctx: TicketContext,
    ticketId: string
  ): Promise<Ticket | null> {
    return await ctx.state.get<Ticket>("tickets", ticketId);
  }

  static async save(ctx: TicketContext, ticket: Ticket): Promise<void> {
    await ctx.state.set("tickets", ticket.ticketId, ticket);
  }

  static async update(
    ctx: TicketContext,
    ticketId: string,
    partial: Partial<Ticket>
  ): Promise<Ticket> {
    const existing = await this.get(ctx, ticketId);
    if (!existing) throw new Error("Ticket not found");

    const updated = {
      ...existing,
      ...partial,
      updatedAt: Date.now(),
    };

    await this.save(ctx, updated);
    return updated;
  }
}
