"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  openClawId: string | null;
  createdAt: string;
}

type MenuKey = "basic" | "users" | "tasks" | "statistics";

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<MenuKey>("basic");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showBindModal, setShowBindModal] = useState(false);
  const [openClawIdInput, setOpenClawIdInput] = useState("");
  const [binding, setBinding] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (!response.ok) {
        router.push("/login");
        return;
      }
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("登出失败:", error);
    }
  };

  const handleBindOpenClawId = async () => {
    if (!openClawIdInput.trim()) {
      setError("请输入绑定 Token");
      return;
    }

    setBinding(true);
    setError("");

    try {
      const response = await fetch("/api/user/openclaw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bindToken: openClawIdInput.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "绑定失败");
        setBinding(false);
        return;
      }

      setUser(data.user);
      setShowBindModal(false);
      setOpenClawIdInput("");
    } catch (err) {
      setError("网络错误，请稍后重试");
    } finally {
      setBinding(false);
    }
  };

  const handleUnbindOpenClawId = async () => {
    if (!confirm("确定要解绑 OpenClaw ID 吗？")) {
      return;
    }

    setBinding(true);
    setError("");

    try {
      const response = await fetch("/api/user/openclaw", {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "解绑失败");
        setBinding(false);
        return;
      }

      setUser(data.user);
    } catch (err) {
      setError("网络错误，请稍后重试");
    } finally {
      setBinding(false);
    }
  };

  const isAdmin = user?.role === "ADMIN";

  const getMenuItems = () => {
    const items = [
      {
        key: "basic" as MenuKey,
        label: "基本信息",
        icon: "👤",
        roles: ["USER", "ADMIN", "PUBLISHER", "AGENT_OWNER"],
      },
    ];

    if (isAdmin) {
      items.push(
        {
          key: "users" as MenuKey,
          label: "用户管理",
          icon: "👥",
          roles: ["ADMIN"],
        },
        {
          key: "tasks" as MenuKey,
          label: "任务管理",
          icon: "📋",
          roles: ["ADMIN"],
        },
        {
          key: "statistics" as MenuKey,
          label: "数据统计",
          icon: "📊",
          roles: ["ADMIN"],
        }
      );
    }

    return items;
  };

  const renderContent = () => {
    switch (activeMenu) {
      case "basic":
        return (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">基本信息</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  用户ID
                </label>
                <p className="text-gray-900 dark:text-white font-mono text-sm">{user?.id}</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  用户名
                </label>
                <p className="text-gray-900 dark:text-white">{user?.username}</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  邮箱
                </label>
                <p className="text-gray-900 dark:text-white">{user?.email}</p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  角色
                </label>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  user?.role === "ADMIN" 
                    ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200" 
                    : user?.role === "PUBLISHER"
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                }`}>
                  {user?.role === "ADMIN" ? "管理员" : user?.role === "PUBLISHER" ? "发布者" : "用户"}
                </span>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 md:col-span-2">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                  注册时间
                </label>
                <p className="text-gray-900 dark:text-white">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleString("zh-CN") : ""}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 md:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      OpenClaw ID
                    </label>
                    {user?.openClawId ? (
                      <p className="text-gray-900 dark:text-white font-mono">{user.openClawId}</p>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400">未绑定</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {user?.openClawId ? (
                      <button
                        onClick={handleUnbindOpenClawId}
                        disabled={binding}
                        className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 rounded-lg transition disabled:opacity-50"
                      >
                        解绑
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowBindModal(true)}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
                      >
                        绑定 OpenClaw ID
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "users":
        return (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">用户管理</h2>
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <div className="text-6xl mb-4">👥</div>
              <p>用户管理功能开发中...</p>
            </div>
          </div>
        );

      case "tasks":
        return (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">任务管理</h2>
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <div className="text-6xl mb-4">📋</div>
              <p>任务管理功能开发中...</p>
            </div>
          </div>
        );

      case "statistics":
        return (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">数据统计</h2>
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <div className="text-6xl mb-4">📊</div>
              <p>数据统计功能开发中...</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-lg text-gray-600 dark:text-gray-400">加载中...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const menuItems = getMenuItems();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-20"} bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
          {sidebarOpen && (
            <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">ClawHub</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <svg
              className="w-5 h-5 text-gray-600 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={sidebarOpen ? "M11 19l-7-7 7-7m8 14l-7-7 7-7" : "M13 5l7 7-7 7M5 5l7 7-7 7"}
              />
            </svg>
          </button>
        </div>

        {/* Menu */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <div className="px-3 space-y-1">
            {sidebarOpen && (
              <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                {isAdmin ? "超级管理员菜单" : "用户菜单"}
              </div>
            )}
            {menuItems.map((item) => (
              <button
                key={item.key}
                onClick={() => setActiveMenu(item.key)}
                className={`w-full flex items-center px-3 py-2.5 rounded-lg transition ${
                  activeMenu === item.key
                    ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {sidebarOpen && <span className="ml-3 font-medium">{item.label}</span>}
              </button>
            ))}
          </div>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className={`${sidebarOpen ? "flex items-center justify-between" : "flex flex-col items-center"}`}>
            {sidebarOpen && (
              <div className="flex items-center min-w-0">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-semibold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {user.username}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className={`${sidebarOpen ? "ml-2" : "mt-2"} p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition`}
              title="登出"
            >
              <svg
                className="w-5 h-5 text-gray-600 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top Bar */}
        <header className="bg-white dark:bg-gray-800 shadow">
          <div className="px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {menuItems.find((item) => item.key === activeMenu)?.label || "管理后台"}
            </h2>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {renderContent()}
        </div>
      </main>

      {/* Bind OpenClaw ID Modal */}
      {showBindModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">绑定 OpenClaw ID</h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                绑定 Token
              </label>
              <input
                type="text"
                value={openClawIdInput}
                onChange={(e) => setOpenClawIdInput(e.target.value)}
                placeholder="请输入 OpenClaw 提供的绑定 Token"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                绑定 Token 由 OpenClaw Agent 验证成功后提供
              </p>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowBindModal(false);
                  setOpenClawIdInput("");
                  setError("");
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition"
              >
                取消
              </button>
              <button
                onClick={handleBindOpenClawId}
                disabled={binding}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition disabled:opacity-50"
              >
                {binding ? "绑定中..." : "确认绑定"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
