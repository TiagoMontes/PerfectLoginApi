import { Session } from '../entities/Session';
import { ISessionRepository } from './ISessionRepository';

export class InMemorySessionRepository implements ISessionRepository {
  private sessions = new Map<string, Session>();

  async create(session: Session): Promise<void> {
    this.sessions.set(session.token, session);
  }

  async findByToken(token: string): Promise<Session | null> {
    const session = this.sessions.get(token);
    if (!session) return null;

    if (new Date() > session.expiresAt) {
      this.sessions.delete(token);
      return null;
    }

    return session;
  }

  async deleteByToken(token: string): Promise<void> {
    this.sessions.delete(token);
  }

  async deleteByUserId(userId: string): Promise<void> {
    for (const [token, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        this.sessions.delete(token);
      }
    }
  }
}
