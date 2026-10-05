import { db, isCloudSqlAvailable } from './index.ts';
import { users } from './schema.ts';
import { eq } from 'drizzle-orm';

const inMemoryUsers = new Map<string, any>();

export async function getOrCreateUser(uid: string, email: string, name: string, role: string = 'student', photoUrl?: string) {
  const userObj = {
    uid,
    email,
    name,
    role,
    photoUrl: photoUrl || null,
    updatedAt: new Date(),
    createdAt: new Date(),
  };
  inMemoryUsers.set(uid, userObj);

  if (isCloudSqlAvailable() && db) {
    try {
      const result = await db.insert(users)
        .values({
          uid,
          email,
          name,
          role,
          photoUrl: photoUrl || null,
        })
        .onConflictDoUpdate({
          target: users.uid,
          set: {
            email,
            name,
            updatedAt: new Date(),
          },
        })
        .returning();

      return result[0];
    } catch (error) {
      console.warn('Database query failed in getOrCreateUser (using fallback):', error);
    }
  }

  return userObj;
}

export async function getUserByUid(uid: string) {
  if (isCloudSqlAvailable() && db) {
    try {
      const result = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
      return result[0] || null;
    } catch (error) {
      console.warn('Database query failed in getUserByUid (using fallback):', error);
    }
  }
  return inMemoryUsers.get(uid) || null;
}
