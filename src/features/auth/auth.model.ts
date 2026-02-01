
import { t, Static } from "elysia";

/**
 * 登录请求体
 */
export const AuthLoginRequest = t.Object({
  username: t.String({ minLength: 3 }),
  password: t.String({ minLength: 6 }),
});


export type AuthLoginRequestType = Static<typeof AuthLoginRequest>;


export const AuthLoginResponse = t.Object({
  token: t.String(),
  user: t.Object({
    id: t.String(),
    username: t.String(),
  }),
});

export type AuthLoginResponseType = Static<typeof AuthLoginResponse>;

export const AuthRegisterRequest = t.Object({
  username: t.String({ minLength: 3 }),
  password: t.String({ minLength: 6 }),
  repeatPassword: t.String({ minLength: 6 }),
});

export type AuthRegisterRequestType = Static<typeof AuthRegisterRequest>;


export const AuthRegisterResponse = t.Object({
  userId: t.String(),
});

export type AuthRegisterResponseType = Static<typeof AuthRegisterResponse>;






