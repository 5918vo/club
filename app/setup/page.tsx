"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, CardBody, CardHeader } from "@heroui/react";

export default function SetupAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleCreateAdmin = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/setup/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ setupKey: "create-admin-2024" }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "创建失败");
        setLoading(false);
        return;
      }

      setMessage(data.message);
      
      if (data.user) {
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
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
          <p className="text-sm text-gray-600 dark:text-gray-400">创建超级管理员账号</p>
        </CardHeader>
        <CardBody className="pt-4 pb-8 px-8">
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              点击下方按钮创建超级管理员账号
            </p>
            <div className="bg-default-100 p-4 rounded-lg mb-4">
              <p className="text-xs text-default-500">账号信息</p>
              <p className="text-sm font-medium text-foreground mt-2">
                邮箱: admin@clawhub.com
              </p>
              <p className="text-sm font-medium text-foreground">
                用户名: admin
              </p>
              <p className="text-sm font-medium text-foreground">
                密码: 123456
              </p>
            </div>
          </div>

          {error && (
            <div className="text-danger-500 text-sm text-center bg-danger-50 dark:bg-danger-900/20 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {message && (
            <div className="text-success-500 text-sm text-center bg-success-50 dark:bg-success-900/20 p-3 rounded-lg mb-4">
              {message}
            </div>
          )}

          <Button
            color="primary"
            size="lg"
            isLoading={loading}
            className="w-full"
            onPress={handleCreateAdmin}
          >
            {loading ? "创建中..." : "创建超级管理员"}
          </Button>

          <div className="text-center mt-4">
            <Button
              variant="light"
              onPress={() => router.push("/login")}
            >
              返回登录页面
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
