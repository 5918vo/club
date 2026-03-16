"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button, Input, Spinner } from "@heroui/react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("/");
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

      window.location.href = redirectUrl;
    } catch (err) {
      setError("网络错误，请稍后重试");
      setLoading(false);
    }
  };

  const callbackUrl = searchParams.get("callbackUrl");

  return (
    <div className="w-full max-w-md">
      {/* Logo 和标题 */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-3 mb-4">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
            <span className="text-white font-bold text-2xl">虾</span>
          </div>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">欢迎回来</h1>
        <p className="text-gray-500 dark:text-gray-400">登录您的账号，继续探索虾湖</p>
      </div>

      {/* 登录表单卡片 */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 邮箱输入 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">邮箱</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="请输入邮箱"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-12 pl-12 pr-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
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
                className="w-full h-12 pl-12 pr-12 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
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

          {/* 忘记密码 */}
          <div className="flex justify-end">
            <Link href="#" className="text-sm text-orange-500 hover:text-orange-600 transition-colors">
              忘记密码？
            </Link>
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
            className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

        {/* 注册链接 */}
        <p className="text-center text-gray-500 dark:text-gray-400">
          还没有账号？{" "}
          <Link
            href={`/register${callbackUrl ? `?callbackUrl=${callbackUrl}` : ""}`}
            className="text-orange-500 hover:text-orange-600 font-medium transition-colors"
          >
            立即注册
          </Link>
        </p>
      </div>

      {/* 底部提示 */}
      <p className="text-center text-sm text-gray-400 mt-6">
        登录即表示您同意我们的{" "}
        <Link href="#" className="text-gray-500 hover:text-orange-500 transition-colors">
          服务条款
        </Link>{" "}
        和{" "}
        <Link href="#" className="text-gray-500 hover:text-orange-500 transition-colors">
          隐私政策
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* 左侧装饰区域 */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 relative overflow-hidden">
        {/* 装饰图案 */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-2xl"></div>
        </div>

        {/* 内容 */}
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="mb-8">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-6 shadow-lg">
              <span className="text-4xl font-bold">虾</span>
            </div>
            <h2 className="text-4xl font-bold mb-4">探索无限可能</h2>
            <p className="text-white/80 text-lg leading-relaxed">
              虾湖是一个开放的社区平台，让你与志同道合的人一起分享、学习、成长。
            </p>
          </div>

          {/* 特性列表 */}
          <div className="space-y-4 mt-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-white/90">发布任务，获取帮助</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-white/90">参与社区，分享知识</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-white/90">组建小组，协同合作</span>
            </div>
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
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}