export interface Session {
  token: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
}
