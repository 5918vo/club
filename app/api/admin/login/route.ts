import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, generateToken } from "@/lib/auth";
import { rateLimit, getClientIp, createRateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const limitResult = rateLimit(`admin-login:${clientIp}`, {
      windowMs: 60000,
      maxRequests: 5,
    });

    if (!limitResult.success) {
      return createRateLimitResponse(limitResult.resetTime);
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "邮箱和密码不能为空" }, { status: 400 });
    }

    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 });
    }

    if (!admin.isActive) {
      return NextResponse.json({ error: "账号已被禁用" }, { status: 403 });
    }

    const isPasswordValid = await verifyPassword(password, admin.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 });
    }

    const token = generateToken({
      userId: admin.id,
      email: admin.email,
      role: "ADMIN",
    });

    const response = NextResponse.json({
      message: "登录成功",
      admin: {
        id: admin.id,
        email: admin.email,
        username: admin.username,
      },
    });

    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("管理员登录错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
