import { DatabaseManager } from '../db';
import { CardLock, CardLockRequest } from '../types';

export class LocksService {
  constructor(private db: DatabaseManager) {}

  async setCardLock(lockData: CardLockRequest): Promise<CardLock> {
    const conn = this.db.getConnection();
    const now = new Date().toISOString();

    const query = `
      INSERT OR REPLACE INTO card_locks (merchant_id, locked, locked_at)
      VALUES (?, ?, ?)
    `;

    return new Promise((resolve, reject) => {
      conn.run(query, [lockData.merchant_id, lockData.locked, lockData.locked ? now : null], function(err: any) {
        if (err) {
          reject(err);
          return;
        }

        resolve({
          merchant_id: lockData.merchant_id,
          locked: lockData.locked,
          locked_at: lockData.locked ? now : ''
        });
      });
    });
  }

  async getCardLock(merchantId: number): Promise<CardLock | null> {
    const conn = this.db.getConnection();
    const query = 'SELECT * FROM card_locks WHERE merchant_id = ?';

    return new Promise((resolve, reject) => {
      conn.get(query, [merchantId], (err: any, row: any) => {
        if (err) {
          reject(err);
          return;
        }

        if (!row) {
          resolve(null);
          return;
        }

        resolve({
          merchant_id: row.merchant_id,
          locked: row.locked,
          locked_at: row.locked_at
        });
      });
    });
  }

  async getAllLocks(): Promise<CardLock[]> {
    const conn = this.db.getConnection();
    const query = 'SELECT * FROM card_locks WHERE locked = true';

    return new Promise((resolve, reject) => {
      conn.all(query, (err: any, rows: any[]) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(rows.map(row => ({
          merchant_id: row.merchant_id,
          locked: row.locked,
          locked_at: row.locked_at
        })));
      });
    });
  }

  async unlockCard(merchantId: number): Promise<void> {
    const conn = this.db.getConnection();
    const query = 'UPDATE card_locks SET locked = false, locked_at = NULL WHERE merchant_id = ?';

    return new Promise((resolve, reject) => {
      conn.run(query, [merchantId], (err: any) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }
}
