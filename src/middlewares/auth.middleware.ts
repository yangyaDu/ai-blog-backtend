import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { getRouteConfig } from "../config/route.config";
import { BizError, ErrorCode } from "../utils/types";


export const authMiddleware = new Elysia()
  .use(
    jwt({
      name: "jwt",
      secret: Bun.env.JWT_SECRET || "devfolio-secret-key-change-me",
      schema: t.Object({
        id: t.String(),
        username: t.String(),
      }),
    })
  )
  // --- 第一步：仅负责解析 Token ---
  .derive({ as: 'global' }, async ({ jwt, headers }) => {
    const authHeader = headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return { sessionInfo: null };
    }

    const token = authHeader.split(" ")[1];
    const payload = await jwt.verify(token);

    return { 
      sessionInfo: payload || null 
    };
  })
  // --- 第二步：配合 onBeforeHandle 执行拦截逻辑 ---
  .onBeforeHandle({ as: 'global' }, ({ sessionInfo, request }) => {
    const path = new URL(request.url).pathname;
    const config = getRouteConfig(path, request.method);

    // 1. 如果配置了忽略鉴权，直接放行
    if (config.authIgnored) {
      return;
    }

    // 2. 如果没忽略鉴权，且 sessionInfo 为空（说明 token 验证失败或缺失）
    if (!sessionInfo) {
      throw new BizError(
        ErrorCode.UNAUTHORIZED, 
        "Missing or invalid authorization token", 
        401
      );
    }
    
    // 3. 这里还可以扩展角色校验，例如：
    // if (config.roles && !config.roles.includes(sessionInfo.role)) {
    //    throw new BizError(ErrorCode.FORBIDDEN, "Permission denied", 403);
    // }
  });