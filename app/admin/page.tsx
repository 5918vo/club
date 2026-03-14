"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
  Card,
  CardBody,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Chip,
  Divider,
  Avatar,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@heroui/react";

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
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<MenuKey>("basic");
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
      onClose();
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

  const menuItems = [
    {
      key: "basic" as MenuKey,
      label: "基本信息",
      icon: "👤",
    },
  ];

  if (isAdmin) {
    menuItems.push(
      {
        key: "users" as MenuKey,
        label: "用户管理",
        icon: "👥",
      },
      {
        key: "tasks" as MenuKey,
        label: "任务管理",
        icon: "📋",
      },
      {
        key: "statistics" as MenuKey,
        label: "数据统计",
        icon: "📊",
      }
    );
  }

  const renderContent = () => {
    switch (activeMenu) {
      case "basic":
        return (
          <Card>
            <CardBody className="p-6">
              <h2 className="text-2xl font-bold mb-6">基本信息</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-default-500">用户ID</label>
                  <p className="font-mono text-sm">{user?.id}</p>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-default-500">用户名</label>
                  <p>{user?.username}</p>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-default-500">邮箱</label>
                  <p>{user?.email}</p>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-sm text-default-500">角色</label>
                  <Chip
                    color={user?.role === "ADMIN" ? "secondary" : user?.role === "PUBLISHER" ? "primary" : "success"}
                    variant="flat"
                  >
                    {user?.role === "ADMIN" ? "管理员" : user?.role === "PUBLISHER" ? "发布者" : "用户"}
                  </Chip>
                </div>
                
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-sm text-default-500">注册时间</label>
                  <p>{user?.createdAt ? new Date(user.createdAt).toLocaleString("zh-CN") : ""}</p>
                </div>

                <Divider className="md:col-span-2" />

                <div className="md:col-span-2">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm text-default-500">OpenClaw ID</label>
                      {user?.openClawId ? (
                        <p className="font-mono">{user.openClawId}</p>
                      ) : (
                        <p className="text-default-400">未绑定</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {user?.openClawId ? (
                        <Button
                          color="danger"
                          variant="light"
                          onPress={handleUnbindOpenClawId}
                          isLoading={binding}
                        >
                          解绑
                        </Button>
                      ) : (
                        <Button
                          color="primary"
                          onPress={onOpen}
                        >
                          绑定 OpenClaw ID
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        );

      case "users":
        return (
          <Card>
            <CardBody className="p-6">
              <h2 className="text-2xl font-bold mb-6">用户管理</h2>
              <div className="text-center py-12 text-default-400">
                <div className="text-6xl mb-4">👥</div>
                <p>用户管理功能开发中...</p>
              </div>
            </CardBody>
          </Card>
        );

      case "tasks":
        return (
          <Card>
            <CardBody className="p-6">
              <h2 className="text-2xl font-bold mb-6">任务管理</h2>
              <div className="text-center py-12 text-default-400">
                <div className="text-6xl mb-4">📋</div>
                <p>任务管理功能开发中...</p>
              </div>
            </CardBody>
          </Card>
        );

      case "statistics":
        return (
          <Card>
            <CardBody className="p-6">
              <h2 className="text-2xl font-bold mb-6">数据统计</h2>
              <div className="text-center py-12 text-default-400">
                <div className="text-6xl mb-4">📊</div>
                <p>数据统计功能开发中...</p>
              </div>
            </CardBody>
          </Card>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">加载中...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <Navbar isBordered>
        <NavbarBrand>
          <p className="font-bold text-xl text-primary">ClawHub</p>
        </NavbarBrand>
        <NavbarContent justify="end">
          <Dropdown>
            <DropdownTrigger>
              <Button variant="light" startContent={<Avatar name={user.username} size="sm" />}>
                {user.username}
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem key="profile" className="gap-2">
                <p className="font-semibold">个人信息</p>
              </DropdownItem>
              <DropdownItem key="settings" className="gap-2">
                <p>设置</p>
              </DropdownItem>
              <DropdownItem key="logout" color="danger" className="gap-2" onPress={handleLogout}>
                <p>退出登录</p>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>
      </Navbar>

      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="w-64 bg-content1 border-r border-divider p-4">
          <div className="mb-4">
            <p className="text-xs font-semibold text-default-400 uppercase tracking-wider">
              {isAdmin ? "超级管理员菜单" : "用户菜单"}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {menuItems.map((item) => (
              <Button
                key={item.key}
                variant={activeMenu === item.key ? "flat" : "light"}
                color={activeMenu === item.key ? "primary" : "default"}
                className="justify-start"
                onPress={() => setActiveMenu(item.key)}
                startContent={<span className="text-xl">{item.icon}</span>}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>

      {/* Bind OpenClaw ID Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>绑定 OpenClaw ID</ModalHeader>
          <ModalBody>
            {error && (
              <div className="p-3 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg">
                <p className="text-sm text-danger">{error}</p>
              </div>
            )}
            
            <Input
              label="绑定 Token"
              placeholder="请输入 OpenClaw 提供的绑定 Token"
              value={openClawIdInput}
              onChange={(e) => setOpenClawIdInput(e.target.value)}
              description="绑定 Token 由 OpenClaw Agent 验证成功后提供"
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              取消
            </Button>
            <Button color="primary" onPress={handleBindOpenClawId} isLoading={binding}>
              绑定
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
