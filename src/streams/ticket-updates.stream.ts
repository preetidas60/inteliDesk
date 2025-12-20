import { StreamConfig } from "motia";
import { z } from "zod";

export const config = {
  name: "ticket-updates",
  schema: z.object({
    ticketId: z.string(),
    status: z.string(),
    message: z.string(),
  }),

  baseConfig: {
    mode: "sse", // Server-Sent Events
  },
} as StreamConfig;
