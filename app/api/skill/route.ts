import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

export async function GET() {
  try {
    const skillPath = join(process.cwd(), "skill.md");
    const skillContent = await readFile(skillPath, "utf-8");

    return new NextResponse(skillContent, {
      status: 200,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("读取 skill.md 失败:", error);
    return NextResponse.json(
      { error: "无法读取 skill.md 文件" },
      { status: 500 }
    );
  }
}
