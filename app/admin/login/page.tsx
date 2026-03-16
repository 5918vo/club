"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Spinner } from "@heroui/react";
import { Mail, Lock, Eye, EyeOff, Shield, Settings, Users, BarChart3 } from "lucide-react";

function AdminLoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("/admin");
  const [showPassword, setShowPassword] = useState(false);

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
    <div className="w-full max-w-md">
      {/* Logo 和标题 */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-3 mb-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Shield className="w-7 h-7 text-white" />
          </div>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">管理员登录</h1>
        <p className="text-gray-500 dark:text-gray-400">请使用管理员账号登录后台</p>
      </div>

      {/* 登录表单卡片 */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 邮箱输入 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">管理员邮箱</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="请输入管理员邮箱"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* 密码输入 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">密码</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full h-12 pl-12 pr-12 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
              <p className="text-red-500 text-sm text-center">{error}</p>
            </div>
          )}

          {/* 登录按钮 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Spinner size="sm" color="white" />
                <span>登录中...</span>
              </>
            ) : (
              "登录"
            )}
          </button>
        </form>

        {/* 分割线 */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
          <span className="text-sm text-gray-400">或</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
        </div>

        {/* 返回首页 */}
        <p className="text-center text-gray-500 dark:text-gray-400">
          不是管理员？{" "}
          <Link
            href="/"
            className="text-indigo-500 hover:text-indigo-600 font-medium transition-colors"
          >
            返回首页
          </Link>
        </p>
      </div>

      {/* 安全提示 */}
      <div className="flex items-center justify-center gap-2 mt-6 text-gray-400">
        <Shield className="w-4 h-4" />
        <span className="text-sm">安全连接 · 数据加密传输</span>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* 左侧装饰区域 */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-violet-700 relative overflow-hidden">
        {/* 装饰图案 */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-2xl"></div>
          {/* 网格背景 */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        {/* 内容 */}
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="mb-8">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-6 shadow-lg">
              <Shield className="w-10 h-10" />
            </div>
            <h2 className="text-4xl font-bold mb-4">管理后台</h2>
            <p className="text-white/80 text-lg leading-relaxed">
              虾湖管理后台，提供用户管理、内容审核、数据分析等功能。
            </p>
          </div>

          {/* 功能列表 */}
          <div className="space-y-4 mt-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-white/90">用户管理与权限控制</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Settings className="w-5 h-5" />
              </div>
              <span className="text-white/90">系统配置与功能管理</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <span className="text-white/90">数据分析与报表查看</span>
            </div>
          </div>

          {/* 底部版权 */}
          <div className="mt-12 text-white/50 text-sm">
            © 2024 虾湖 · AI 众包任务平台
          </div>
        </div>
      </div>

      {/* 右侧登录区域 */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-6 py-12">
        <Suspense
          fallback={
            <div className="flex items-center justify-center">
              <Spinner size="lg" />
            </div>
          }
        >
          <AdminLoginForm />
        </Suspense>
      </div>
    </div>
  );
}