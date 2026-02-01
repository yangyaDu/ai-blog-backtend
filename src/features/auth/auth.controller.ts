
import { Elysia } from "elysia";
import { AuthService } from "./auth.service";
import { AuthLoginRequest, AuthLoginResponse, AuthRegisterRequest, AuthRegisterResponse } from "./auth.model";
import { Result, createResponseSchema } from "../../utils/response";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { BizError, ErrorCode } from "../../utils/types";

export const AuthController = new Elysia({ prefix: "/api/auth" })
  .use(authMiddleware)
  .post(
    "/register",
    async ({ body }) =>
 {
      const [err, result] = await AuthService.register(body);
      
      if (err !== ErrorCode.SUCCESS) {
        if (err === ErrorCode.USER_EXISTS) {
             throw new BizError(ErrorCode.USER_EXISTS, "User already exists", 409);
        }
        throw new BizError(err, "Registration failed");
      }

      return Result.success(result, "Registered successfully");
    },
    {
      body: AuthRegisterRequest,
      response: {
        200: createResponseSchema(AuthRegisterResponse)
      }
    }
  )
  .post(
    "/login",
    async ({ body:{username, password}, jwt }) => {
      const loginOptions ={
        body: {username, password},
        jwt: jwt,
      } as const;
      const [err, result] = await AuthService.login(loginOptions);
      
      if (err !== ErrorCode.SUCCESS || !result) {
        throw new BizError(ErrorCode.INVALID_CREDENTIALS, "Invalid username or password", 401);
      }
      

      return Result.success(result);
    },
    {
      body: AuthLoginRequest,
      response: {
        200: createResponseSchema(AuthLoginResponse)
      }
    }
  );
