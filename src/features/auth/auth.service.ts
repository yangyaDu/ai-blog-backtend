
import { db } from "../../db";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";
import { randomUUID, createHash } from "crypto";
import { ErrorCode } from "../../utils/types";
import { AuthLoginRequestType, AuthLoginResponseType, AuthRegisterRequestType, AuthRegisterResponseType } from "./auth.model";
export const AuthService = {
  // Helper to hash password with MD5 (Legacy requirement)
  // WARNING: MD5 is not secure for production passwords.
  hashPassword(pwd: string): string {
    return createHash('md5').update(pwd).digest('hex');
  },

  async register(data: AuthRegisterRequestType): Promise<[ErrorCode, AuthRegisterResponseType | null]> {
    // 1. Check User Existence
    const existing = await db.select().from(users).where(eq(users.username, data.username)).get();
    if (existing) {
      return [ErrorCode.USER_EXISTS, null];
    }

    if (data.password !== data.repeatPassword) {
      return [ErrorCode.PASSWORD_MISMATCH, null];
    }

    // 2. Hash Password (MD5)
    const hashedPassword = this.hashPassword(data.password);
    const userId = randomUUID();

    await db.insert(users).values({
      id: userId,
      username: data.username,
      passwordHash: hashedPassword,
    });
    const result = {
      userId: userId,
    }

    return [ErrorCode.SUCCESS, result];
  },

  async login(data:{body: AuthLoginRequestType, jwt: any}): Promise<[ErrorCode, AuthLoginResponseType | null]> {
    const user = await db.select().from(users).where(eq(users.username, data.body.username)).get();

    // Verify using MD5
    if (!user || user.passwordHash !== this.hashPassword(data.body.password)) {
      return [ErrorCode.INVALID_CREDENTIALS, null];
    }
    const token = await data.jwt.sign({
      id: user.id,
      username: user.username,
    });

    return [ErrorCode.SUCCESS, { token:token, user: { id: user.id, username: user.username } }];
  }
};
