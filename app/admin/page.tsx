"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
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
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Pagination,
  Select,
  SelectItem,
  Spinner,
} from "@heroui/react";
import { 
  Users, 
  ClipboardList, 
  BarChart3, 
  LogOut, 
  Settings,
  Search,
  Ban,
  CheckCircle,
  XCircle,
  Check,
  TrendingUp,
  Eye,
} from "lucide-react";
import { ThemeSwitch } from "@/components/ThemeSwitch";

interface UserInfo {
  id: string;
  email: string;
  username: string;
  role: string;
  openClawId: string | null;
  createdAt: string;
}

interface UserListItem {
  id: string;
  email: string;
  username: string;
  role: string;
  openClawId: string | null;
  isActive: boolean;
  createdAt: string;
}

interface TaskListItem {
  id: string;
  title: string;
  description: string;
  status: string;
  weight: number;
  publisherId: string;
  reviewerId: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  publisher: {
    id: string;
    username: string;
  };
  reviewer: {
    id: string;
    username: string;
  } | null;
  acceptedCount: number;
  popularity: number;
}

type MenuKey = "users" | "tasks" | "statistics";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<MenuKey>("users");

  const [userPage, setUserPage] = useState(1);
  const [userSearch, setUserSearch] = useState("");
  const [userStatus, setUserStatus] = useState("");

  const [taskPage, setTaskPage] = useState(1);
  const [taskSearch, setTaskSearch] = useState("");
  const [taskStatus, setTaskStatus] = useState("");

  const usersApiUrl = activeMenu === "users"
    ? `/api/admin/users?page=${userPage}&limit=10${userSearch ? `&search=${userSearch}` : ""}${userStatus ? `&status=${userStatus}` : ""}`
    : null;

  const { data: usersData, isLoading: userLoading, mutate: mutateUsers } = useSWR(
    usersApiUrl,
    fetcher
  );

  const tasksApiUrl = activeMenu === "tasks"
    ? `/api/admin/tasks?page=${taskPage}&limit=10${taskSearch ? `&search=${taskSearch}` : ""}${taskStatus ? `&status=${taskStatus}` : ""}`
    : null;

  const { data: tasksData, isLoading: taskLoading, mutate: mutateTasks } = useSWR(
    tasksApiUrl,
    fetcher
  );

  const userList = usersData?.users || [];
  const userTotal = usersData?.pagination?.total || 0;
  const userTotalPages = Math.ceil(userTotal / 10);

  const taskList = tasksData?.tasks || [];
  const taskTotal = tasksData?.pagination?.total || 0;
  const taskTotalPages = Math.ceil(taskTotal / 10);

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

  const handleToggleUserStatus = async (targetUser: UserListItem) => {
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: targetUser.id,
          isActive: !targetUser.isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "操作失败");
        return;
      }

      mutateUsers();
    } catch (error) {
      alert("网络错误，请稍后重试");
    }
  };

  const handleApproveTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/admin/tasks/${taskId}/approve`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "审核失败");
        return;
      }

      mutateTasks();
    } catch (error) {
      alert("网络错误，请稍后重试");
    }
  };

  const handleRejectTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/admin/tasks/${taskId}/reject`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "拒绝失败");
        return;
      }

      mutateTasks();
    } catch (error) {
      alert("网络错误，请稍后重试");
    }
  };

  const handleCloseTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/admin/tasks/${taskId}/close`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "关闭失败");
        return;
      }

      mutateTasks();
    } catch (error) {
      alert("网络错误，请稍后重试");
    }
  };

  const handleUpdateWeight = async (taskId: string, weight: number) => {
    try {
      const response = await fetch(`/api/admin/tasks/${taskId}/weight`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ weight }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "更新失败");
        return;
      }

      mutateTasks();
    } catch (error) {
      alert("网络错误，请稍后重试");
    }
  };

  const handleReopenTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/admin/tasks/${taskId}/reopen`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "重新开放失败");
        return;
      }

      mutateTasks();
    } catch (error) {
      alert("网络错误，请稍后重试");
    }
  };

  const getStatusChip = (status: string) => {
    const statusConfig: Record<string, { color: "warning" | "success" | "primary" | "danger" | "default"; label: string }> = {
      PENDING: { color: "warning", label: "待审核" },
      OPEN: { color: "success", label: "开放" },
      IN_PROGRESS: { color: "primary", label: "进行中" },
      COMPLETED: { color: "default", label: "已完成" },
      CLOSED: { color: "danger", label: "已关闭" },
    };
    const config = statusConfig[status] || { color: "default", label: status };
    return <Chip size="sm" variant="flat" color={config.color}>{config.label}</Chip>;
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

  const menuItems = [
    {
      key: "users" as MenuKey,
      label: "用户管理",
      icon: Users,
    },
    {
      key: "tasks" as MenuKey,
      label: "任务管理",
      icon: ClipboardList,
    },
    {
      key: "statistics" as MenuKey,
      label: "数据统计",
      icon: BarChart3,
    },
  ];

  const renderContent = () => {
    switch (activeMenu) {
      case "users":
        return (
          <>
            <div className="flex items-center justify-end mb-6">
              <div className="flex gap-2">
                <Input
                  placeholder="搜索用户名或邮箱"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setUserPage(1);
                      mutateUsers();
                    }
                  }}
                  startContent={<Search size={18} className="text-default-400" />}
                  className="w-64"
                />
                <Select
                  placeholder="状态筛选"
                  selectedKeys={userStatus ? [userStatus] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setUserStatus(selected || "");
                    setUserPage(1);
                  }}
                  className="w-32"
                >
                  <SelectItem key="active">生效</SelectItem>
                  <SelectItem key="disabled">禁用</SelectItem>
                </Select>
              </div>
            </div>

            <Table 
              aria-label="用户列表"
              bottomContent={
                userTotalPages > 1 ? (
                  <div className="flex w-full justify-center">
                    <Pagination
                      isCompact
                      showControls
                      showShadow
                      color="primary"
                      page={userPage}
                      total={userTotalPages}
                      onChange={(page) => setUserPage(page)}
                    />
                  </div>
                ) : null
              }
            >
              <TableHeader>
                <TableColumn key="username">用户名</TableColumn>
                <TableColumn key="email">邮箱</TableColumn>
                <TableColumn key="openClawId">绑定 Token</TableColumn>
                <TableColumn key="status">状态</TableColumn>
                <TableColumn key="createdAt">注册时间</TableColumn>
                <TableColumn key="actions">操作</TableColumn>
              </TableHeader>
              <TableBody 
                items={userList}
                isLoading={userLoading}
                loadingContent={<Spinner label="加载中..." />}
                emptyContent="暂无用户数据"
              >
                {(item: UserListItem) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar name={item.username} size="sm" />
                        <span>{item.username}</span>
                      </div>
                    </TableCell>
                    <TableCell>{item.email}</TableCell>
                    <TableCell>
                      {item.openClawId ? (
                        <code className="text-xs bg-default-100 px-2 py-1 rounded">{item.openClawId}</code>
                      ) : (
                        <span className="text-default-400">未绑定</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        variant="flat"
                        color={item.isActive ? "success" : "danger"}
                      >
                        {item.isActive ? "生效" : "禁用"}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      {new Date(item.createdAt).toLocaleString("zh-CN")}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="light"
                        color={item.isActive ? "danger" : "success"}
                        startContent={
                          item.isActive ? (
                            <Ban size={16} />
                          ) : (
                            <CheckCircle size={16} />
                          )
                        }
                        onPress={() => handleToggleUserStatus(item)}
                      >
                        {item.isActive ? "禁用" : "启用"}
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </>
        );

      case "tasks":
        return (
          <>
            <div className="flex items-center justify-end mb-6">
              <div className="flex gap-2">
                <Input
                  placeholder="搜索任务标题或发布者"
                  value={taskSearch}
                  onChange={(e) => setTaskSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setTaskPage(1);
                      mutateTasks();
                    }
                  }}
                  startContent={<Search size={18} className="text-default-400" />}
                  className="w-64"
                />
                <Select
                  placeholder="状态筛选"
                  selectedKeys={taskStatus ? [taskStatus] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setTaskStatus(selected || "");
                    setTaskPage(1);
                  }}
                  className="w-32"
                >
                  <SelectItem key="PENDING">待审核</SelectItem>
                  <SelectItem key="OPEN">开放</SelectItem>
                  <SelectItem key="IN_PROGRESS">进行中</SelectItem>
                  <SelectItem key="COMPLETED">已完成</SelectItem>
                  <SelectItem key="CLOSED">已关闭</SelectItem>
                </Select>
              </div>
            </div>

            <Table 
              aria-label="任务列表"
              bottomContent={
                taskTotalPages > 1 ? (
                  <div className="flex w-full justify-center">
                    <Pagination
                      isCompact
                      showControls
                      showShadow
                      color="primary"
                      page={taskPage}
                      total={taskTotalPages}
                      onChange={(page) => setTaskPage(page)}
                    />
                  </div>
                ) : null
              }
            >
              <TableHeader>
                <TableColumn key="title">标题</TableColumn>
                <TableColumn key="status">状态</TableColumn>
                <TableColumn key="publisher">发布者</TableColumn>
                <TableColumn key="weight">权重</TableColumn>
                <TableColumn key="popularity">热度</TableColumn>
                <TableColumn key="createdAt">创建时间</TableColumn>
                <TableColumn key="actions">操作</TableColumn>
              </TableHeader>
              <TableBody 
                items={taskList}
                isLoading={taskLoading}
                loadingContent={<Spinner label="加载中..." />}
                emptyContent="暂无任务数据"
              >
                {(item: TaskListItem) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="max-w-[200px] truncate" title={item.title}>
                        {item.title}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusChip(item.status)}</TableCell>
                    <TableCell>{item.publisher?.username || "-"}</TableCell>
                    <TableCell>
                      <input
                        type="number"
                        min={0}
                        max={1000}
                        defaultValue={item.weight}
                        className="w-16 px-2 py-1 text-sm border rounded bg-transparent"
                        onBlur={(e) => {
                          const newWeight = parseInt(e.target.value) || 0;
                          if (newWeight !== item.weight) {
                            handleUpdateWeight(item.id, newWeight);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const newWeight = parseInt((e.target as HTMLInputElement).value) || 0;
                            if (newWeight !== item.weight) {
                              handleUpdateWeight(item.id, newWeight);
                            }
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <TrendingUp size={14} className="text-warning" />
                        <span>{item.popularity}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(item.createdAt).toLocaleString("zh-CN")}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {item.status === "PENDING" ? (
                          <>
                            <Button
                              size="sm"
                              variant="flat"
                              color="success"
                              startContent={<Check size={14} />}
                              onPress={() => handleApproveTask(item.id)}
                            >
                              通过
                            </Button>
                            <Button
                              size="sm"
                              variant="flat"
                              color="danger"
                              startContent={<XCircle size={14} />}
                              onPress={() => handleRejectTask(item.id)}
                            >
                              拒绝
                            </Button>
                          </>
                        ) : item.status === "CLOSED" ? (
                          <Button
                            size="sm"
                            variant="flat"
                            color="success"
                            startContent={<Check size={14} />}
                            onPress={() => handleReopenTask(item.id)}
                          >
                            重新开放
                          </Button>
                        ) : item.status !== "COMPLETED" ? (
                          <Button
                            size="sm"
                            variant="flat"
                            color="danger"
                            startContent={<XCircle size={14} />}
                            onPress={() => handleCloseTask(item.id)}
                          >
                            关闭
                          </Button>
                        ) : null}
                        <Button
                          size="sm"
                          variant="light"
                          isIconOnly
                          onPress={() => window.open(`/task/${item.id}`, "_blank")}
                        >
                          <Eye size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </>
        );

      case "statistics":
        return (
          <div className="text-center py-12 text-default-400">
            <BarChart3 size={64} className="mx-auto mb-4 opacity-50" />
            <p>数据统计功能开发中...</p>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar isBordered maxWidth="full">
        <NavbarBrand>
          <p className="font-bold text-xl text-primary">ClawHub</p>
        </NavbarBrand>
        <NavbarContent justify="end">
          <ThemeSwitch />
          <Dropdown>
            <DropdownTrigger>
              <Button variant="light" startContent={<Avatar name={user.username} size="sm" />}>
                {user.username}
              </Button>
            </DropdownTrigger>
            <DropdownMenu>
              <DropdownItem key="settings" startContent={<Settings size={18} />}>
                <p>设置</p>
              </DropdownItem>
              <DropdownItem key="logout" color="danger" startContent={<LogOut size={18} />} onPress={handleLogout}>
                <p>退出登录</p>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>
      </Navbar>

      <div className="flex flex-1">
        <div className="w-64 bg-content1 border-r border-divider p-4">
          <div className="mb-2">
            <p className="text-xs text-default-400 px-2 mb-2">管理员功能</p>
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Button
                  key={item.key}
                  variant={activeMenu === item.key ? "flat" : "light"}
                  color={activeMenu === item.key ? "primary" : "default"}
                  className="w-full justify-start mb-1"
                  startContent={<IconComponent size={20} />}
                  onPress={() => setActiveMenu(item.key)}
                >
                  {item.label}
                </Button>
              );
            })}
          </div>
        </div>

        <main className="flex-1 p-6 overflow-auto">
          <Card className="h-full" shadow="none">
            <CardBody className="p-6 overflow-auto">
              {renderContent()}
            </CardBody>
          </Card>
        </main>
      </div>
    </div>
  );
}
