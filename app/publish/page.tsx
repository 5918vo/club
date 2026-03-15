"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Textarea,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import { User, LogOut, ArrowLeft } from "lucide-react";
import { ThemeSwitch } from "@/components/ThemeSwitch";

export default function PublishPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; username: string; role: string } | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({});

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        } else {
          router.push("/login");
        }
      })
      .catch(() => router.push("/login"));
  }, [router]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const validate = () => {
    const newErrors: { title?: string; description?: string } = {};
    if (title.length < 3) newErrors.title = "标题至少3个字符";
    if (title.length > 100) newErrors.title = "标题最多100个字符";
    if (description.length < 10) newErrors.description = "描述至少10个字符";
    if (description.length > 2000) newErrors.description = "描述最多2000个字符";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });

      const result = await res.json();

      if (res.ok) {
        alert("任务创建成功，等待审核！");
        router.push("/");
      } else {
        alert(result.error || "创建失败");
      }
    } catch (error) {
      alert("网络错误");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar isBordered maxWidth="full">
        <NavbarBrand>
          <Link href="/">
            <p className="font-bold text-xl text-primary">ClawHub</p>
          </Link>
        </NavbarBrand>
        <NavbarContent justify="center" className="hidden sm:flex">
          <NavbarItem>
            <Link href="/">
              <Button variant="light">任务大厅</Button>
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href="/publish">
              <Button variant="light" color="primary">发布任务</Button>
            </Link>
          </NavbarItem>
        </NavbarContent>
        <NavbarContent justify="end">
          <ThemeSwitch />
          <Dropdown>
            <DropdownTrigger>
              <Button variant="light" startContent={<User size={20} />}>
                {user.username}
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem key="profile">个人中心</DropdownItem>
              {user.role === "ADMIN" && (
                <DropdownItem key="admin">
                  <Link href="/admin">管理后台</Link>
                </DropdownItem>
              )}
              <DropdownItem key="logout" color="danger" onPress={handleLogout}>
                <span className="flex items-center gap-2">
                  <LogOut size={16} /> 退出登录
                </span>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>
      </Navbar>

      <main className="flex-1 container mx-auto px-4 py-6 max-w-2xl">
        <div className="mb-4">
          <Link href="/">
            <Button variant="light" startContent={<ArrowLeft size={20} />}>
              返回
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader className="p-6">
            <h1 className="text-xl font-bold">发布新任务</h1>
          </CardHeader>
          <CardBody className="p-6 pt-0">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">任务标题</label>
                <Input
                  placeholder="请输入任务标题"
                  value={title}
                  onValueChange={setTitle}
                  isInvalid={!!errors.title}
                  errorMessage={errors.title}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">任务描述</label>
                <Textarea
                  placeholder="请详细描述任务内容、要求等..."
                  value={description}
                  onValueChange={setDescription}
                  minRows={6}
                  maxRows={12}
                  isInvalid={!!errors.description}
                  errorMessage={errors.description}
                />
                <p className="text-xs text-default-400 mt-1">
                  {description.length}/2000 字符
                </p>
              </div>

              <div className="bg-warning-50 rounded-lg p-4 text-sm text-warning-600">
                <p>提示：任务发布后需要管理员审核通过才能展示在任务大厅。</p>
              </div>

              <Button
                color="primary"
                size="lg"
                className="w-full"
                onPress={handleSubmit}
                isLoading={submitting}
              >
                提交任务
              </Button>
            </div>
          </CardBody>
        </Card>
      </main>
    </div>
  );
}
