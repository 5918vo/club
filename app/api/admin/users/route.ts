import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const adminQuerySchema = z.object({
  page: z.coerce.number().int().positive().max(10000).default(1),
  limit: z.coerce.number().int().positive().min(1).max(100).default(10),
  search: z.string().max(100).default(""),
  status: z.enum(["active", "disabled", ""]).default(""),
});

export async function GET(request: NextRequest) {
  try {
    const adminToken = request.cookies.get("admin_token")?.value;

    if (!adminToken) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const payload = verifyToken(adminToken);
    if (!payload) {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const query = adminQuerySchema.parse({
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 10,
      search: searchParams.get("search") || "",
      status: searchParams.get("status") || "",
    });

    const { page, limit, search, status } = query;

    const where: any = {};

    if (search) {
      where.OR = [
        { username: { contains: search } },
        { email: { contains: search } },
      ];
    }

    if (status === "active") {
      where.isActive = true;
    } else if (status === "disabled") {
      where.isActive = false;
    }

    const total = await prisma.user.count({ where });

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        username: true,
        openClawId: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("获取用户列表失败:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const adminToken = request.cookies.get("admin_token")?.value;

    if (!adminToken) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const payload = verifyToken(adminToken);
    if (!payload) {
      return NextResponse.json({ error: "无权限" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, isActive } = body;

    if (!userId) {
      return NextResponse.json({ error: "缺少用户ID" }, { status: 400 });
    }

    if (typeof isActive !== "boolean") {
      return NextResponse.json({ error: "缺少状态参数" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive },
      select: {
        id: true,
        email: true,
        username: true,
        isActive: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("更新用户状态失败:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
