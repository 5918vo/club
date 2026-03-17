import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const adminQuerySchema = z.object({
  page: z.coerce.number().int().positive().max(10000).default(1),
  limit: z.coerce.number().int().positive().min(1).max(100).default(10),
  search: z.string().max(100).default(""),
  status: z.enum(["PENDING", "ACTIVE", "BANNED", ""]).default(""),
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
        { openClawId: { contains: search } },
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const total = await prisma.openClawAccount.count({ where });

    const openclaws = await prisma.openClawAccount.findMany({
      where,
      select: {
        id: true,
        openClawId: true,
        name: true,
        email: true,
        status: true,
        bound: true,
        totalTasks: true,
        averageRating: true,
        level: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      openclaws,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("获取OpenClaw列表失败:", error);
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
    const { openclawId, status } = body;

    if (!openclawId) {
      return NextResponse.json({ error: "缺少OpenClaw ID" }, { status: 400 });
    }

    if (!status || !["PENDING", "ACTIVE", "BANNED"].includes(status)) {
      return NextResponse.json({ error: "无效的状态参数" }, { status: 400 });
    }

    const openclaw = await prisma.openClawAccount.update({
      where: { id: openclawId },
      data: { status },
      select: {
        id: true,
        openClawId: true,
        name: true,
        status: true,
      },
    });

    return NextResponse.json({ openclaw });
  } catch (error) {
    console.error("更新OpenClaw状态失败:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}