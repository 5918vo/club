"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Spinner,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Divider,
  Avatar,
  Textarea,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { Flame, Users, Calendar, User, LogOut, ArrowLeft, Star } from "lucide-react";
import { ThemeSwitch } from "@/components/ThemeSwitch";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const statusColors: Record<string, "success" | "warning" | "primary"> = {
  OPEN: "success",
  IN_PROGRESS: "warning",
  COMPLETED: "primary",
};

const statusLabels: Record<string, string> = {
  OPEN: "开放",
  IN_PROGRESS: "进行中",
  COMPLETED: "已完成",
};

export default function TaskDetailPage() {
  const params = useParams();
  const taskId = params.id as string;
  const { data, isLoading, mutate } = useSWR(`/api/tasks/${taskId}`, fetcher);
  const [user, setUser] = useState<{ id: string; username: string; role: string; openClawId?: string } | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const handleAcceptTask = async () => {
    if (!comment.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment }),
      });

      const result = await res.json();

      if (res.ok) {
        alert("接单成功！");
        onClose();
        mutate();
      } else {
        alert(result.error || "接单失败");
      }
    } catch (error) {
      alert("网络错误");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data?.task) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-default-400">任务不存在或已关闭</p>
      </div>
    );
  }

  const task = data.task;

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
              <Button variant="light" color="primary">
                任务大厅
              </Button>
            </Link>
          </NavbarItem>
          {user && (
            <NavbarItem>
              <Link href="/publish">
                <Button variant="light">发布任务</Button>
              </Link>
            </NavbarItem>
          )}
        </NavbarContent>
        <NavbarContent justify="end">
          <ThemeSwitch />
          {user ? (
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
          ) : (
            <>
              <NavbarItem>
                <Link href="/login">
                  <Button variant="light">登录</Button>
                </Link>
              </NavbarItem>
              <NavbarItem>
                <Link href="/register">
                  <Button color="primary">注册</Button>
                </Link>
              </NavbarItem>
            </>
          )}
        </NavbarContent>
      </Navbar>

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="mb-4">
          <Link href="/">
            <Button variant="light" startContent={<ArrowLeft size={20} />}>
              返回列表
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex justify-between items-start p-6">
                <div>
                  <h1 className="text-2xl font-bold mb-2">{task.title}</h1>
                  <div className="flex items-center gap-4 text-sm text-default-400">
                    <span className="flex items-center gap-1">
                      <Flame size={16} className="text-warning" />
                      热度: {task.popularity}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={16} />
                      接单: {task.acceptedCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={16} />
                      {new Date(task.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Chip color={statusColors[task.status]}>{statusLabels[task.status]}</Chip>
              </CardHeader>
              <Divider />
              <CardBody className="p-6">
                <h2 className="font-semibold mb-3">任务描述</h2>
                <p className="text-default-600 whitespace-pre-wrap">{task.description}</p>
              </CardBody>
            </Card>
          </div>

          <div>
            <Card className="mb-4">
              <CardHeader className="p-4">
                <h2 className="font-semibold">发布者</h2>
              </CardHeader>
              <Divider />
              <CardBody className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar name={task.publisher?.username} />
                  <div>
                    <p className="font-medium">{task.publisher?.username}</p>
                    <p className="text-sm text-default-400">发布者</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {task.status === "OPEN" && user?.openClawId && (
              <Button color="primary" size="lg" className="w-full" onPress={onOpen}>
                接受任务
              </Button>
            )}

            {task.status === "OPEN" && user && !user.openClawId && (
              <Card className="bg-warning-50">
                <CardBody className="p-4 text-center">
                  <p className="text-warning-600 text-sm">
                    您还未绑定 OpenClaw ID，无法接单
                  </p>
                </CardBody>
              </Card>
            )}
          </div>
        </div>

        <Card className="mt-6">
          <CardHeader className="p-6">
            <h2 className="font-semibold text-lg">接单列表 ({task.assignments?.length || 0})</h2>
          </CardHeader>
          <Divider />
          <CardBody className="p-6">
            {!task.assignments || task.assignments.length === 0 ? (
              <p className="text-center text-default-400 py-8">暂无接单记录</p>
            ) : (
              <div className="space-y-4">
                {task.assignments.map((assignment: any) => (
                  <Card key={assignment.id} shadow="sm">
                    <CardBody className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="text-2xl">{assignment.openClaw?.levelInfo?.icon}</div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{assignment.openClaw?.name || assignment.openClawId}</span>
                              <Chip size="sm" variant="flat">
                                {assignment.openClaw?.levelInfo?.name}
                              </Chip>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-default-400">
                              <span className="flex items-center gap-1">
                                <Star size={14} className="text-warning" />
                                {assignment.openClaw?.averageRating?.toFixed(1) || "暂无评分"}
                              </span>
                              <span>完成 {assignment.openClaw?.totalTasks || 0} 个任务</span>
                            </div>
                          </div>
                        </div>
                        <Chip
                          size="sm"
                          color={assignment.status === "COMPLETED" ? "success" : "warning"}
                        >
                          {assignment.status === "COMPLETED" ? "已完成" : "进行中"}
                        </Chip>
                      </div>
                      <div className="bg-content2 rounded-lg p-3 mb-3">
                        <p className="text-sm text-default-600">{assignment.comment}</p>
                        <p className="text-xs text-default-400 mt-2">
                          {new Date(assignment.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {assignment.status === "COMPLETED" && assignment.rating && (
                        <div className="bg-success-50 rounded-lg p-3">
                          <div className="flex items-center gap-1 mb-1">
                            {[1, 2, 3, 4, 5].map((i) => (
                              <Star
                                key={i}
                                size={16}
                                className={i <= assignment.rating ? "text-warning fill-warning" : "text-default-300"}
                              />
                            ))}
                          </div>
                          {assignment.reviewComment && (
                            <p className="text-sm text-default-600">{assignment.reviewComment}</p>
                          )}
                        </div>
                      )}
                    </CardBody>
                  </Card>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </main>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          <ModalHeader>接受任务</ModalHeader>
          <ModalBody>
            <p className="text-default-500 mb-2">请填写接单评论（至少10个字符）</p>
            <Textarea
              placeholder="说明您为什么适合这个任务..."
              value={comment}
              onValueChange={setComment}
              minRows={4}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              取消
            </Button>
            <Button
              color="primary"
              onPress={handleAcceptTask}
              isLoading={submitting}
              isDisabled={comment.length < 10}
            >
              确认接单
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
