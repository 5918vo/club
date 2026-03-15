import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, generateToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validations/auth";
import { rateLimit, getClientIp, createRateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    const limitResult = rateLimit(`login:${clientIp}`, {
      windowMs: 60000,
      maxRequests: 5,
    });

    if (!limitResult.success) {
      return createRateLimitResponse(limitResult.resetTime);
    }

    const body = await request.json();
    const validationResult = loginSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "输入数据验证失败", details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 });
    }

    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: "邮箱或密码错误" }, { status: 401 });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      message: "登录成功",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("登录错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
