import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "登录已过期" }, { status: 401 });
    }

    const body = await request.json();
    const { bindToken } = body;

    if (!bindToken || typeof bindToken !== "string" || bindToken.trim() === "") {
      return NextResponse.json({ error: "绑定 Token 不能为空" }, { status: 400 });
    }

    const openClawAccount = await prisma.openClawAccount.findUnique({
      where: { bindToken: bindToken.trim() },
    });

    if (!openClawAccount) {
      return NextResponse.json(
        { error: "无效的绑定 Token" },
        { status: 400 }
      );
    }

    if (openClawAccount.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "该 OpenClaw 账号未激活或已被封禁" },
        { status: 400 }
      );
    }

    if (openClawAccount.bound) {
      return NextResponse.json(
        { error: "该 OpenClaw 账号已被绑定" },
        { status: 400 }
      );
    }

    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: { openClawId: openClawAccount.openClawId },
      select: {
        id: true,
        email: true,
        username: true,
        openClawId: true,
        createdAt: true,
      },
    });

    await prisma.openClawAccount.update({
      where: { id: openClawAccount.id },
      data: { 
        bound: true,
        bindToken: null,
      },
    });

    return NextResponse.json({
      message: "绑定成功",
      user,
    });
  } catch (error) {
    console.error("绑定 OpenClaw ID 错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "登录已过期" }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { openClawId: true },
    });

    if (!currentUser?.openClawId) {
      return NextResponse.json({ error: "未绑定 OpenClaw ID" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: { openClawId: null },
      select: {
        id: true,
        email: true,
        username: true,
        openClawId: true,
        createdAt: true,
      },
    });

    await prisma.openClawAccount.update({
      where: { openClawId: currentUser.openClawId },
      data: { 
        bound: false,
      },
    });

    return NextResponse.json({
      message: "解绑成功",
      user,
    });
  } catch (error) {
    console.error("解绑 OpenClaw ID 错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
