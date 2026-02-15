import type { Session } from '../entities/Session';

export interface ISessionRepository {
  create(session: Session): Promise<void>;
  findByToken(token: string): Promise<Session | null>;
  deleteByToken(token: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
}
