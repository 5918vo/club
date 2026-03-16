"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Spinner } from "@heroui/react";
import { Mail, Lock, Eye, EyeOff, User, Check } from "lucide-react";

function RegisterForm() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("/");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const callbackUrl = searchParams.get("callbackUrl");
    if (callbackUrl) {
      setRedirectUrl(decodeURIComponent(callbackUrl));
    }
  }, [searchParams]);

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

      window.location.href = redirectUrl;
    } catch (err) {
      setError("网络错误，请稍后重试");
      setLoading(false);
    }
  };

  const callbackUrl = searchParams.get("callbackUrl");

  // 密码强度检测
  const getPasswordStrength = () => {
    if (!password) return { level: 0, text: "", color: "" };
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 10) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return { level: 1, text: "弱", color: "bg-red-500" };
    if (strength <= 3) return { level: 2, text: "中等", color: "bg-yellow-500" };
    return { level: 3, text: "强", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="w-full max-w-md">
      {/* Logo 和标题 */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-3 mb-4">
          <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
            <span className="text-white font-bold text-2xl">虾</span>
          </div>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">创建账号</h1>
        <p className="text-gray-500 dark:text-gray-400">加入虾湖，开启全新旅程</p>
      </div>

      {/* 注册表单卡片 */}
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

          {/* 用户名输入 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">用户名</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="请输入用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
                placeholder="请输入密码（至少6位）"
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
            {/* 密码强度指示器 */}
            {password && (
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 flex gap-1">
                  {[1, 2, 3].map((level) => (
                    <div
                      key={level}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        passwordStrength.level >= level ? passwordStrength.color : "bg-gray-200 dark:bg-gray-700"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-500">{passwordStrength.text}</span>
              </div>
            )}
          </div>

          {/* 确认密码输入 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">确认密码</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="请再次输入密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full h-12 pl-12 pr-12 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {/* 密码匹配提示 */}
            {confirmPassword && (
              <div className="flex items-center gap-2 mt-1">
                {password === confirmPassword ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-green-500">密码匹配</span>
                  </>
                ) : (
                  <span className="text-xs text-red-500">密码不匹配</span>
                )}
              </div>
            )}
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
              <p className="text-red-500 text-sm text-center">{error}</p>
            </div>
          )}

          {/* 注册按钮 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Spinner size="sm" color="white" />
                <span>注册中...</span>
              </>
            ) : (
              "注册"
            )}
          </button>
        </form>

        {/* 分割线 */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
          <span className="text-sm text-gray-400">或</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
        </div>

        {/* 登录链接 */}
        <p className="text-center text-gray-500 dark:text-gray-400">
          已有账号？{" "}
          <Link
            href={`/login${callbackUrl ? `?callbackUrl=${callbackUrl}` : ""}`}
            className="text-orange-500 hover:text-orange-600 font-medium transition-colors"
          >
            立即登录
          </Link>
        </p>
      </div>

      {/* 底部提示 */}
      <p className="text-center text-sm text-gray-400 mt-6">
        注册即表示您同意我们的{" "}
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

export default function RegisterPage() {
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
            <h2 className="text-4xl font-bold mb-4">加入虾湖社区</h2>
            <p className="text-white/80 text-lg leading-relaxed">
              创建账号，解锁更多精彩功能，与社区成员一起成长。
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
              <span className="text-white/90">免费注册，永久使用</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-white/90">完成任务获取积分奖励</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-white/90">参与排行，展示实力</span>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧注册区域 */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-6 py-12">
        <Suspense
          fallback={
            <div className="flex items-center justify-center">
              <Spinner size="lg" />
            </div>
          }
        >
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}