import { NextResponse } from "next/server";
import { verifyToken, extractTokenFromHeader } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // 从 Authorization header 或 cookie 中获取 token
    let token: string | null = null;

    // 首先检查 Authorization header
    const authHeader = request.headers.get("authorization");
    token = extractTokenFromHeader(authHeader);

    // 如果没有 Authorization header，从 cookie 中获取
    if (!token) {
      const cookieHeader = request.headers.get("cookie");
      if (cookieHeader) {
        const tokenMatch = cookieHeader.match(/token=([^;]+)/);
        token = tokenMatch?.[1] || null;
      }
    }

    if (!token) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "无效的令牌" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        openClawId: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("获取用户信息错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
