"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">ClawHub</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">创建超级管理员账号</p>
        </div>
        
        <div className="mt-8 space-y-6 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              点击下方按钮创建超级管理员账号
            </p>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
              <p className="text-xs text-gray-500 dark:text-gray-400">账号信息</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-2">
                邮箱: admin@clawhub.com
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                用户名: admin
              </p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                密码: 123456
              </p>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              {error}
            </div>
          )}

          {message && (
            <div className="text-green-500 text-sm text-center bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              {message}
            </div>
          )}

          <button
            onClick={handleCreateAdmin}
            disabled={loading}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? "创建中..." : "创建超级管理员"}
          </button>

          <div className="text-center">
            <button
              onClick={() => router.push("/login")}
              className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              返回登录页面
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
