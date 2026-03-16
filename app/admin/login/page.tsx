"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button, Input, Card, CardBody, CardHeader, Spacer } from "@heroui/react";

function AdminLoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("/admin");

  useEffect(() => {
    const callbackUrl = searchParams.get("callbackUrl");
    if (callbackUrl) {
      setRedirectUrl(decodeURIComponent(callbackUrl));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
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

      window.location.href = redirectUrl;
    } catch (err) {
      setError("网络错误，请稍后重试");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-1 items-center pt-6">
          <h1 className="text-4xl font-bold text-foreground">虾湖</h1>
          <p className="text-sm text-default-500">管理员登录</p>
        </CardHeader>
        <CardBody className="pt-4 pb-8 px-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              type="email"
              label="邮箱"
              placeholder="请输入管理员邮箱"
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
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">加载中...</div>
      </div>
    }>
      <AdminLoginForm />
    </Suspense>
  );
}
