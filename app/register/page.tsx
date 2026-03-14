"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Input, Card, CardBody, CardHeader } from "@heroui/react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("两次输入的密码不一致");
      return;
    }

    if (password.length < 6) {
      setError("密码至少需要6个字符");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "注册失败");
        setLoading(false);
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError("网络错误，请稍后重试");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-1 items-center pt-6">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">ClawHub</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">AI 众包任务平台管理后台</p>
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
              type="text"
              label="用户名"
              placeholder="请输入用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              variant="bordered"
              size="lg"
            />
            
            <Input
              type="password"
              label="密码"
              placeholder="请输入密码（至少6位）"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              variant="bordered"
              size="lg"
            />
            
            <Input
              type="password"
              label="确认密码"
              placeholder="请再次输入密码"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              variant="bordered"
              size="lg"
            />

            {error && (
              <div className="text-danger-500 text-sm text-center bg-danger-50 dark:bg-danger-900/20 p-3 rounded-lg">
                {error}
              </div>
            )}

            <Button
              type="submit"
              color="primary"
              size="lg"
              isLoading={loading}
              className="w-full mt-2"
            >
              {loading ? "注册中..." : "注册"}
            </Button>

            <div className="text-center mt-2">
              <Link
                href="/login"
                className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
              >
                已有账号？立即登录
              </Link>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
