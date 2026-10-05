import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';
import fs from 'fs';

declare global {
  var _postgresPool: Pool | undefined;
}

export function isCloudSqlAvailable(): boolean {
  if (!process.env.SQL_HOST) return false;
  if (process.env.SQL_HOST.startsWith('/')) {
    try {
      if (!fs.existsSync(process.env.SQL_HOST)) {
        return false;
      }
      const files = fs.readdirSync(process.env.SQL_HOST);
      return files.some((f) => f.includes('.s.PGSQL'));
    } catch {
      return false;
    }
  }
  return true;
}

export const createPool = () => {
  if (!global._postgresPool && isCloudSqlAvailable()) {
    global._postgresPool = new Pool({
      host: process.env.SQL_HOST,
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DB_NAME,
      max: 10,
      connectionTimeoutMillis: 15000,
    });

    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
    });
  }
  return global._postgresPool;
};

const pool = createPool();
export const db = pool ? drizzle(pool, { schema }) : (null as any);
