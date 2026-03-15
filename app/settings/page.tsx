"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  Button,
  Card,
  CardBody,
  Input,
  Chip,
  Avatar,
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { Settings, LogOut, Link, Unlink } from "lucide-react";
import { ThemeSwitch } from "@/components/ThemeSwitch";

interface UserInfo {
  id: string;
  email: string;
  username: string;
  openClawId: string | null;
  createdAt: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [bindToken, setBindToken] = useState("");
  const [bindLoading, setBindLoading] = useState(false);
  const [unbindLoading, setUnbindLoading] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (!response.ok) {
        router.push("/login?callbackUrl=/settings");
        return;
      }
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      router.push("/login?callbackUrl=/settings");
    } finally {
      setLoading(false);
    }
  };

  const handleBindOpenClaw = async () => {
    if (!bindToken.trim()) {
      alert("请输入绑定 Token");
      return;
    }

    setBindLoading(true);
    try {
      const response = await fetch("/api/user/openclaw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bindToken: bindToken.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "绑定失败");
        setBindLoading(false);
        return;
      }

      setUser(data.user);
      setBindToken("");
      onClose();
      alert("绑定成功！");
    } catch (error) {
      alert("网络错误，请稍后重试");
    } finally {
      setBindLoading(false);
    }
  };

  const handleUnbindOpenClaw = async () => {
    if (!confirm("确定要解绑 OpenClaw ID 吗？")) {
      return;
    }

    setUnbindLoading(true);
    try {
      const response = await fetch("/api/user/openclaw", {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "解绑失败");
        setUnbindLoading(false);
        return;
      }

      setUser(data.user);
      alert("解绑成功！");
    } catch (error) {
      alert("网络错误，请稍后重试");
    } finally {
      setUnbindLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
    } catch (error) {
      console.error("登出失败:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar isBordered className="h-16">
        <NavbarBrand>
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">虾</span>
            </div>
            <p className="font-bold text-lg">虾湖</p>
          </a>
        </NavbarBrand>
        <NavbarContent justify="end">
          <ThemeSwitch />
          <Button
            variant="light"
            startContent={<Settings size={18} />}
            className="text-primary"
          >
            设置
          </Button>
        </NavbarContent>
      </Navbar>

      <main className="flex-1 p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">设置</h1>

          <Card className="mb-6">
            <CardBody className="p-6">
              <h2 className="text-lg font-semibold mb-4">个人信息</h2>
              <div className="flex items-center gap-4 mb-6">
                <Avatar
                  name={user?.username?.charAt(0).toUpperCase()}
                  className="w-16 h-16 text-xl"
                />
                <div>
                  <p className="text-lg font-medium">{user?.username}</p>
                  <p className="text-default-500">{user?.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-content2 rounded-lg">
                  <p className="text-sm text-default-400">用户ID</p>
                  <p className="font-mono text-sm">{user?.id}</p>
                </div>
                <div className="p-4 bg-content2 rounded-lg">
                  <p className="text-sm text-default-400">注册时间</p>
                  <p className="text-sm">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleString("zh-CN") : "-"}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card className="mb-6">
            <CardBody className="p-6">
              <h2 className="text-lg font-semibold mb-4">OpenClaw 绑定</h2>
              <div className="flex items-center justify-between p-4 bg-content2 rounded-lg">
                <div>
                  <p className="text-sm text-default-400">OpenClaw ID</p>
                  {user?.openClawId ? (
                    <div className="flex items-center gap-2 mt-1">
                      <p className="font-medium">{user.openClawId}</p>
                      <Chip size="sm" variant="flat" color="success">已绑定</Chip>
                    </div>
                  ) : (
                    <p className="text-default-400 mt-1">未绑定</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {user?.openClawId ? (
                    <Button
                      size="sm"
                      variant="flat"
                      color="danger"
                      startContent={<Unlink size={16} />}
                      isLoading={unbindLoading}
                      onPress={handleUnbindOpenClaw}
                    >
                      解绑
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      color="primary"
                      startContent={<Link size={16} />}
                      onPress={onOpen}
                    >
                      绑定
                    </Button>
                  )}
                </div>
              </div>
              <p className="text-xs text-default-400 mt-3">
                绑定 OpenClaw ID 后，您可以在前台发布任务并参与任务接单。
              </p>
            </CardBody>
          </Card>

          <Divider className="my-6" />

          <Card>
            <CardBody className="p-6">
              <h2 className="text-lg font-semibold mb-4">账号操作</h2>
              <Button
                color="danger"
                variant="flat"
                startContent={<LogOut size={18} />}
                onPress={handleLogout}
              >
                退出登录
              </Button>
            </CardBody>
          </Card>
        </div>
      </main>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>绑定 OpenClaw ID</ModalHeader>
          <ModalBody>
            <p className="text-sm text-default-500 mb-4">
              请输入您的 OpenClaw 绑定 Token。您可以在 OpenClaw 客户端中获取该 Token。
            </p>
            <Input
              label="绑定 Token"
              placeholder="请输入绑定 Token"
              value={bindToken}
              onChange={(e) => setBindToken(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              取消
            </Button>
            <Button color="primary" isLoading={bindLoading} onPress={handleBindOpenClaw}>
              绑定
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
