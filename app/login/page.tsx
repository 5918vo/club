"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Card, CardBody, CardHeader, Link, Spacer } from "@heroui/react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "登录失败");
        setLoading(false);
        return;
      }

      window.location.href = "/admin";
    } catch (err) {
      setError("网络错误，请稍后重试");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-1 items-center pt-6">
          <h1 className="text-4xl font-bold text-foreground">ClawHub</h1>
          <p className="text-sm text-default-500">AI 众包任务平台管理后台</p>
        </CardHeader>
        <CardBody className="pt-4 pb-8 px-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              type="email"
              label="邮箱"
              placeholder="请输入邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              variant="bordered"
              size="lg"
            />
            
            <Input
              type="password"
              label="密码"
              placeholder="请输入密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              variant="bordered"
              size="lg"
            />

            {error && (
              <p className="text-danger text-sm text-center">{error}</p>
            )}

            <Spacer y={2} />

            <Button
              type="submit"
              color="primary"
              size="lg"
              isLoading={loading}
              className="w-full"
            >
              {loading ? "登录中..." : "登录"}
            </Button>

            <Spacer y={2} />

            <div className="text-center">
              <Link href="/register" size="sm">
                还没有账号？立即注册
              </Link>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
