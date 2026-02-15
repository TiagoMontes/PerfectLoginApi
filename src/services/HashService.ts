export class HashService {
  async hash(plaintext: string): Promise<string> {
    return await Bun.password.hash(plaintext, {
      algorithm: 'bcrypt',
      cost: 10
    });
  }

  async verify(plaintext: string, hash: string): Promise<boolean> {
    return await Bun.password.verify(plaintext, hash);
  }
}
