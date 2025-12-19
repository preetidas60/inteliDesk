export interface Ticket {
  ticketId: string;
  userId: string;
  description: string;
  proof?: {
    type: "text" | "image";
    value: string;
  };
  status: string;
  createdAt: number;
  updatedAt: number;
  attempts: number;
}
