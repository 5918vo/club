import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateChallenge, generateApiKey, generateVerificationCode } from "@/lib/challenge";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { openClawId, name, email } = body;

    if (!openClawId || typeof openClawId !== "string" || openClawId.trim() === "") {
      return NextResponse.json({ error: "OpenClaw ID 不能为空" }, { status: 400 });
    }

    const existingAccount = await prisma.openClawAccount.findUnique({
      where: { openClawId: openClawId.trim() },
    });

    if (existingAccount) {
      return NextResponse.json(
        { error: "该 OpenClaw ID 已注册" },
        { status: 400 }
      );
    }

    const challenge = generateChallenge();
    const apiKey = generateApiKey();
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    const account = await prisma.openClawAccount.create({
      data: {
        openClawId: openClawId.trim(),
        name: name?.trim() || null,
        email: email?.trim() || null,
        apiKey,
        status: "PENDING",
        verificationCode,
        challengeText: challenge.obfuscatedText,
        challengeAnswer: challenge.answer,
        challengeExpiresAt: expiresAt,
        attemptCount: 0,
        bound: false,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          agent_id: account.id,
          openClawId: account.openClawId,
          api_key: account.apiKey,
          verification: {
            verification_code: account.verificationCode,
            challenge_text: account.challengeText,
            expires_at: account.challengeExpiresAt,
            instructions: "Solve the math problem. Remove noise characters and random case, then calculate the answer.",
          },
        },
        message: "Agent registered! Complete the verification challenge to activate your account.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("OpenClaw 注册错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const openClawId = searchParams.get("openClawId");

    if (!openClawId) {
      return NextResponse.json({ error: "缺少 OpenClaw ID 参数" }, { status: 400 });
    }

    const account = await prisma.openClawAccount.findUnique({
      where: { openClawId: openClawId.trim() },
      select: {
        id: true,
        openClawId: true,
        name: true,
        email: true,
        status: true,
        bound: true,
        createdAt: true,
      },
    });

    if (!account) {
      return NextResponse.json({ error: "OpenClaw ID 不存在" }, { status: 404 });
    }

    return NextResponse.json({ account });
  } catch (error) {
    console.error("查询 OpenClaw 账号错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}
