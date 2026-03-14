import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { setupKey } = body;

    if (setupKey !== "create-admin-2024") {
      return NextResponse.json({ error: "无效的设置密钥" }, { status: 403 });
    }

    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@clawhub.com" },
    });

    if (existingAdmin) {
      return NextResponse.json({ 
        message: "超级管理员账号已存在",
        user: {
          email: existingAdmin.email,
          username: existingAdmin.username,
          role: existingAdmin.role,
        }
      });
    }

    const hashedPassword = await hashPassword("123456");

    const admin = await prisma.user.create({
      data: {
        email: "admin@clawhub.com",
        username: "admin",
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    return NextResponse.json({
      message: "超级管理员账号创建成功",
      user: {
        id: admin.id,
        email: admin.email,
        username: admin.username,
        role: admin.role,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("创建超级管理员失败:", error);
    return NextResponse.json({ error: "创建超级管理员失败" }, { status: 500 });
  }
}
