import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get("cookie");
    const tokenMatch = cookieHeader?.match(/admin_token=([^;]+)/);
    const token = tokenMatch?.[1];

    if (!token) {
      return NextResponse.json({ error: "未授权" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "无效的令牌" }, { status: 401 });
    }

    const admin = await prisma.admin.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
      },
    });

    if (!admin) {
      return NextResponse.json({ error: "管理员不存在" }, { status: 404 });
    }

    return NextResponse.json({ admin });
  } catch (error) {
    console.error("获取管理员信息错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
