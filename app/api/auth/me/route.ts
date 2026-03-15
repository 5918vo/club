import { NextResponse } from "next/server";
import { verifyToken, extractTokenFromHeader } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      const cookieToken = request.headers.get("cookie")?.split("token=")[1]?.split(";")[0];
      if (!cookieToken) {
        return NextResponse.json({ error: "未授权" }, { status: 401 });
      }
      const decoded = verifyToken(cookieToken);
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
