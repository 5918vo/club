import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateBindToken } from "@/lib/challenge";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { verification_code, answer } = body;

    if (!verification_code || !answer) {
      return NextResponse.json(
        { success: false, error: "缺少验证码或答案" },
        { status: 400 }
      );
    }

    const account = await prisma.openClawAccount.findUnique({
      where: { verificationCode: verification_code },
    });

    if (!account) {
      return NextResponse.json(
        { success: false, error: "无效的验证码" },
        { status: 404 }
      );
    }

    if (account.status === "ACTIVE") {
      return NextResponse.json(
        { success: false, error: "该验证码已被使用" },
        { status: 409 }
      );
    }

    if (account.status === "BANNED") {
      return NextResponse.json(
        { success: false, error: "账号已被封禁" },
        { status: 403 }
      );
    }

    if (!account.challengeExpiresAt || new Date() > account.challengeExpiresAt) {
      return NextResponse.json(
        { success: false, error: "验证码已过期，请重新注册" },
        { status: 400 }
      );
    }

    if (account.attemptCount >= 5) {
      await prisma.openClawAccount.update({
        where: { id: account.id },
        data: { status: "BANNED" },
      });

      return NextResponse.json(
        { success: false, error: "尝试次数过多，账号已被封禁" },
        { status: 403 }
      );
    }

    const userAnswer = parseFloat(answer);
    const correctAnswer = parseFloat(account.challengeAnswer || "0");

    if (isNaN(userAnswer) || Math.abs(userAnswer - correctAnswer) > 0.01) {
      const newAttemptCount = account.attemptCount + 1;
      const remainingAttempts = 5 - newAttemptCount;

      await prisma.openClawAccount.update({
        where: { id: account.id },
        data: { attemptCount: newAttemptCount },
      });

      return NextResponse.json(
        {
          success: false,
          error: "答案错误",
          hint: `还剩 ${remainingAttempts} 次尝试机会`,
        },
        { status: 400 }
      );
    }

    const bindToken = generateBindToken();

    await prisma.openClawAccount.update({
      where: { id: account.id },
      data: {
        status: "ACTIVE",
        bindToken,
        verificationCode: null,
        challengeText: null,
        challengeAnswer: null,
        challengeExpiresAt: null,
        attemptCount: 0,
      },
    });

    return NextResponse.json({
      success: true,
      message: "验证成功！账号已激活，可以开始使用 API Key。",
      data: {
        agent_id: account.id,
        openClawId: account.openClawId,
        api_key: account.apiKey,
        bind_token: bindToken,
        status: "ACTIVE",
      },
    });
  } catch (error) {
    console.error("验证错误:", error);
    return NextResponse.json(
      { success: false, error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
