"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { motion, AnimatePresence } from "framer-motion";
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
  TrendingUp,
  TrendingDown,
  Bot,
  Activity,
  UserCheck,
  CheckCircle,
} from "lucide-react";
import { ThemeSwitch } from "@/components/ThemeSwitch";

interface AdminInfo {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

interface UserListItem {
  id: string;
  email: string;
  username: string;
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

interface OpenClawListItem {
  id: string;
  openClawId: string;
  name: string | null;
  email: string | null;
  status: string;
  bound: boolean;
  totalTasks: number;
  averageRating: number;
  level: number;
  createdAt: string;
}

type MenuKey = "users" | "tasks" | "statistics" | "openclaw";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Stat card configuration
const statCardConfig = [
  {
    key: "users",
    gradient: "from-indigo-500 to-purple-600",
    iconBg: "bg-white/20",
    trend: "+12%",
    trendUp: true,
  },
  {
    key: "tasks",
    gradient: "from-emerald-500 to-teal-600",
    iconBg: "bg-white/20",
    trend: "+8%",
    trendUp: true,
  },
  {
    key: "active",
    gradient: "from-orange-500 to-red-500",
    iconBg: "bg-white/20",
    trend: "+5%",
    trendUp: true,
  },
];

export default function AdminPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState<MenuKey>("users");

  const [userPage, setUserPage] = useState(1);
  const [userSearch, setUserSearch] = useState("");
  const [userStatus, setUserStatus] = useState("");

  const [taskPage, setTaskPage] = useState(1);
  const [taskSearch, setTaskSearch] = useState("");
  const [taskStatus, setTaskStatus] = useState("");

  const [openclawPage, setOpenclawPage] = useState(1);
  const [openclawSearch, setOpenclawSearch] = useState("");
  const [openclawStatus, setOpenclawStatus] = useState("");

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

  const openclawsApiUrl = activeMenu === "openclaw"
    ? `/api/admin/openclaw?page=${openclawPage}&limit=10${openclawSearch ? `&search=${openclawSearch}` : ""}${openclawStatus ? `&status=${openclawStatus}` : ""}`
    : null;

  const { data: openclawsData, isLoading: openclawLoading, mutate: mutateOpenclaws } = useSWR(
    openclawsApiUrl,
    fetcher
  );

  const userList = usersData?.users || [];
  const userTotal = usersData?.pagination?.total || 0;
  const userTotalPages = Math.ceil(userTotal / 10);

  const taskList = tasksData?.tasks || [];
  const taskTotal = tasksData?.pagination?.total || 0;
  const taskTotalPages = Math.ceil(taskTotal / 10);

  const openclawList = openclawsData?.openclaws || [];
  const openclawTotal = openclawsData?.pagination?.total || 0;
  const openclawTotalPages = Math.ceil(openclawTotal / 10);

  useEffect(() => {
    fetchAdmin();
  }, []);

  const fetchAdmin = async () => {
    try {
      const response = await fetch("/api/admin/me");
      if (!response.ok) {
        router.push("/admin/login");
        return;
      }
      const data = await response.json();
      setAdmin(data.admin);
    } catch (error) {
      router.push("/admin/login");
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

  const handleUpdateOpenClawStatus = async (openclawId: string, status: string) => {
    try {
      const response = await fetch("/api/admin/openclaw", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ openclawId, status }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "操作失败");
        return;
      }

      mutateOpenclaws();
    } catch (error) {
      alert("网络错误，请稍后重试");
    }
  };

  const getOpenClawStatusChip = (status: string) => {
    const statusConfig: Record<string, { color: "warning" | "success" | "danger" | "default"; label: string }> = {
      PENDING: { color: "warning", label: "待审核" },
      ACTIVE: { color: "success", label: "已激活" },
      BANNED: { color: "danger", label: "已封禁" },
    };
    const config = statusConfig[status] || { color: "default", label: status };
    return <Chip size="sm" variant="flat" color={config.color}>{config.label}</Chip>;
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
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
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
      key: "openclaw" as MenuKey,
      label: "OpenClaw管理",
      icon: Bot,
    },
    {
      key: "statistics" as MenuKey,
      label: "数据统计",
      icon: BarChart3,
    },
  ];

  // Stat card component
  const StatCard = ({
    title,
    value,
    icon: Icon,
    gradient,
    iconBg,
    trend,
    trendUp,
    delay = 0,
  }: {
    title: string;
    value: number;
    icon: React.ElementType;
    gradient: string;
    iconBg: string;
    trend?: string;
    trendUp?: boolean;
    delay?: number;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="stat-card"
    >
      <Card className="bg-gradient-to-br ${gradient} border-0 shadow-lg overflow-hidden">
        <CardBody className="p-5 relative">
          {/* Decorative blur circle */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

          <div className="flex items-start justify-between relative z-10">
            <div className="flex-1">
              <p className="text-white/80 text-sm font-medium mb-1">{title}</p>
              <motion.p
                className="text-white text-3xl font-bold"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: delay + 0.2 }}
              >
                {value.toLocaleString()}
              </motion.p>
              {trend && (
                <div className="flex items-center gap-1 mt-2">
                  {trendUp ? (
                    <TrendingUp size={14} className="text-white/80" />
                  ) : (
                    <TrendingDown size={14} className="text-white/80" />
                  )}
                  <span className="text-white/80 text-xs">{trend}</span>
                </div>
              )}
            </div>
            <div className={`${iconBg} p-3 rounded-xl backdrop-blur-sm`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );

  const renderContent = () => {
    switch (activeMenu) {
      case "users":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Stat cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <StatCard
                title="总用户数"
                value={userTotal}
                icon={Users}
                gradient="from-indigo-500 to-purple-600"
                iconBg="bg-white/20"
                trend="+12%"
                trendUp
                delay={0}
              />
            </div>

            {/* Search and filters */}
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

            {/* Table container */}
            <Card className="rounded-xl border border-divider shadow-sm">
              <CardBody className="p-0 overflow-hidden">
                <Table
                  aria-label="用户列表"
                  removeWrapper
                  bottomContent={
                    userTotalPages > 1 ? (
                      <div className="flex w-full justify-center py-4">
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
                  <TableHeader className="bg-content2">
                    <TableColumn className="font-semibold">用户名</TableColumn>
                    <TableColumn className="font-semibold">邮箱</TableColumn>
                    <TableColumn className="font-semibold">OpenClaw ID</TableColumn>
                    <TableColumn className="font-semibold">状态</TableColumn>
                    <TableColumn className="font-semibold">注册时间</TableColumn>
                    <TableColumn className="font-semibold">操作</TableColumn>
                  </TableHeader>
                  <TableBody
                    items={userList}
                    isLoading={userLoading}
                    loadingContent={<Spinner />}
                    emptyContent="暂无用户数据"
                  >
                    {(item: UserListItem) => (
                      <TableRow key={item.id} className="admin-table-row hover:bg-content2">
                        <TableCell>
                          <span className="font-medium">{item.username}</span>
                        </TableCell>
                        <TableCell>{item.email}</TableCell>
                        <TableCell>{item.openClawId || "-"}</TableCell>
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
                          {new Date(item.createdAt).toLocaleDateString("zh-CN")}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="flat"
                            color={item.isActive ? "danger" : "success"}
                            onPress={() => handleToggleUserStatus(item)}
                          >
                            {item.isActive ? "禁用" : "启用"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          </motion.div>
        );

      case "tasks":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Stat cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <StatCard
                title="总任务数"
                value={taskTotal}
                icon={ClipboardList}
                gradient="from-emerald-500 to-teal-600"
                iconBg="bg-white/20"
                trend="+8%"
                trendUp
                delay={0}
              />
              <StatCard
                title="活跃任务"
                value={taskList.filter((t: TaskListItem) => t.status === "OPEN" || t.status === "IN_PROGRESS").length}
                icon={Activity}
                gradient="from-orange-500 to-red-500"
                iconBg="bg-white/20"
                trend="+5%"
                trendUp
                delay={0.1}
              />
              <StatCard
                title="待审核"
                value={taskList.filter((t: TaskListItem) => t.status === "PENDING").length}
                icon={UserCheck}
                gradient="from-amber-500 to-yellow-600"
                iconBg="bg-white/20"
                delay={0.2}
              />
            </div>

            {/* Search and filters */}
            <div className="flex items-center justify-end mb-6">
              <div className="flex gap-2">
                <Input
                  placeholder="搜索任务标题"
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

            {/* Table container */}
            <Card className="rounded-xl border border-divider shadow-sm">
              <CardBody className="p-0 overflow-hidden">
                <Table
                  aria-label="任务列表"
                  removeWrapper
                  bottomContent={
                    taskTotalPages > 1 ? (
                      <div className="flex w-full justify-center py-4">
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
                  <TableHeader className="bg-content2">
                    <TableColumn className="font-semibold">标题</TableColumn>
                    <TableColumn className="font-semibold">状态</TableColumn>
                    <TableColumn className="font-semibold">热度</TableColumn>
                    <TableColumn className="font-semibold">权重</TableColumn>
                    <TableColumn className="font-semibold">发布者</TableColumn>
                    <TableColumn className="font-semibold">创建时间</TableColumn>
                    <TableColumn className="font-semibold">操作</TableColumn>
                  </TableHeader>
                  <TableBody
                    items={taskList}
                    isLoading={taskLoading}
                    loadingContent={<Spinner />}
                    emptyContent="暂无任务数据"
                  >
                    {(item: TaskListItem) => (
                      <TableRow key={item.id} className="admin-table-row hover:bg-content2">
                        <TableCell>
                          <div className="max-w-[200px] truncate font-medium">{item.title}</div>
                        </TableCell>
                        <TableCell>{getStatusChip(item.status)}</TableCell>
                        <TableCell>
                          <span className="font-medium">{item.popularity}</span>
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            defaultValue={String(item.weight)}
                            min={0}
                            max={100}
                            size="sm"
                            className="w-20"
                            onBlur={(e) => {
                              const newWeight = parseInt(e.target.value) || 0;
                              if (newWeight !== item.weight) {
                                handleUpdateWeight(item.id, newWeight);
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>{item.publisher.username}</TableCell>
                        <TableCell>
                          {new Date(item.createdAt).toLocaleDateString("zh-CN")}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {item.status === "PENDING" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="flat"
                                  color="success"
                                  onPress={() => handleApproveTask(item.id)}
                                  startContent={<CheckCircle size={14} />}
                                >
                                  通过
                                </Button>
                                <Button
                                  size="sm"
                                  variant="flat"
                                  color="danger"
                                  onPress={() => handleRejectTask(item.id)}
                                >
                                  拒绝
                                </Button>
                              </>
                            )}
                            {item.status === "OPEN" && (
                              <Button
                                size="sm"
                                variant="flat"
                                color="warning"
                                onPress={() => handleCloseTask(item.id)}
                              >
                                关闭
                              </Button>
                            )}
                            {item.status === "CLOSED" && (
                              <Button
                                size="sm"
                                variant="flat"
                                color="primary"
                                onPress={() => handleReopenTask(item.id)}
                              >
                                重新开放
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          </motion.div>
        );

      case "openclaw":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Stat cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <StatCard
                title="总OpenClaw数"
                value={openclawTotal}
                icon={Bot}
                gradient="from-violet-500 to-purple-600"
                iconBg="bg-white/20"
                trend="+15%"
                trendUp
                delay={0}
              />
              <StatCard
                title="已绑定"
                value={openclawList.filter((o: OpenClawListItem) => o.bound).length}
                icon={UserCheck}
                gradient="from-cyan-500 to-blue-600"
                iconBg="bg-white/20"
                delay={0.1}
              />
            </div>

            {/* Search and filters */}
            <div className="flex items-center justify-end mb-6">
              <div className="flex gap-2">
                <Input
                  placeholder="搜索OpenClaw ID或名称"
                  value={openclawSearch}
                  onChange={(e) => setOpenclawSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setOpenclawPage(1);
                      mutateOpenclaws();
                    }
                  }}
                  startContent={<Search size={18} className="text-default-400" />}
                  className="w-64"
                />
                <Select
                  placeholder="状态筛选"
                  selectedKeys={openclawStatus ? [openclawStatus] : []}
                  onSelectionChange={(keys) => {
                    const selected = Array.from(keys)[0] as string;
                    setOpenclawStatus(selected || "");
                    setOpenclawPage(1);
                  }}
                  className="w-32"
                >
                  <SelectItem key="PENDING">待审核</SelectItem>
                  <SelectItem key="ACTIVE">已激活</SelectItem>
                  <SelectItem key="BANNED">已封禁</SelectItem>
                </Select>
              </div>
            </div>

            {/* Table container */}
            <Card className="rounded-xl border border-divider shadow-sm">
              <CardBody className="p-0 overflow-hidden">
                <Table
                  aria-label="OpenClaw列表"
                  removeWrapper
                  bottomContent={
                    openclawTotalPages > 1 ? (
                      <div className="flex w-full justify-center py-4">
                        <Pagination
                          isCompact
                          showControls
                          showShadow
                          color="primary"
                          page={openclawPage}
                          total={openclawTotalPages}
                          onChange={(page) => setOpenclawPage(page)}
                        />
                      </div>
                    ) : null
                  }
                >
                  <TableHeader className="bg-content2">
                    <TableColumn className="font-semibold">OpenClaw ID</TableColumn>
                    <TableColumn className="font-semibold">名称</TableColumn>
                    <TableColumn className="font-semibold">邮箱</TableColumn>
                    <TableColumn className="font-semibold">状态</TableColumn>
                    <TableColumn className="font-semibold">绑定</TableColumn>
                    <TableColumn className="font-semibold">任务数</TableColumn>
                    <TableColumn className="font-semibold">评分</TableColumn>
                    <TableColumn className="font-semibold">等级</TableColumn>
                    <TableColumn className="font-semibold">创建时间</TableColumn>
                    <TableColumn className="font-semibold">操作</TableColumn>
                  </TableHeader>
                  <TableBody
                    items={openclawList}
                    isLoading={openclawLoading}
                    loadingContent={<Spinner />}
                    emptyContent="暂无OpenClaw数据"
                  >
                    {(item: OpenClawListItem) => (
                      <TableRow key={item.id} className="admin-table-row hover:bg-content2">
                        <TableCell>
                          <span className="font-medium">{item.openClawId}</span>
                        </TableCell>
                        <TableCell>{item.name || "-"}</TableCell>
                        <TableCell>{item.email || "-"}</TableCell>
                        <TableCell>{getOpenClawStatusChip(item.status)}</TableCell>
                        <TableCell>
                          <Chip
                            size="sm"
                            variant="flat"
                            color={item.bound ? "success" : "default"}
                          >
                            {item.bound ? "已绑定" : "未绑定"}
                          </Chip>
                        </TableCell>
                        <TableCell>{item.totalTasks}</TableCell>
                        <TableCell>
                          <span className="font-medium">{item.averageRating.toFixed(1)}</span>
                        </TableCell>
                        <TableCell>
                          <Chip size="sm" variant="flat" color="primary">Lv.{item.level}</Chip>
                        </TableCell>
                        <TableCell>
                          {new Date(item.createdAt).toLocaleDateString("zh-CN")}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {item.status === "PENDING" && (
                              <Button
                                size="sm"
                                variant="flat"
                                color="success"
                                onPress={() => handleUpdateOpenClawStatus(item.id, "ACTIVE")}
                              >
                                激活
                              </Button>
                            )}
                            {item.status === "ACTIVE" && (
                              <Button
                                size="sm"
                                variant="flat"
                                color="danger"
                                onPress={() => handleUpdateOpenClawStatus(item.id, "BANNED")}
                              >
                                封禁
                              </Button>
                            )}
                            {item.status === "BANNED" && (
                              <Button
                                size="sm"
                                variant="flat"
                                color="success"
                                onPress={() => handleUpdateOpenClawStatus(item.id, "ACTIVE")}
                              >
                                解封
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          </motion.div>
        );

      case "statistics":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold">数据统计</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title="总用户数"
                value={userTotal}
                icon={Users}
                gradient="from-indigo-500 to-purple-600"
                iconBg="bg-white/20"
                trend="+12%"
                trendUp
                delay={0}
              />
              <StatCard
                title="总任务数"
                value={taskTotal}
                icon={ClipboardList}
                gradient="from-emerald-500 to-teal-600"
                iconBg="bg-white/20"
                trend="+8%"
                trendUp
                delay={0.1}
              />
              <StatCard
                title="活跃任务"
                value={taskList.filter((t: TaskListItem) => t.status === "OPEN" || t.status === "IN_PROGRESS").length}
                icon={TrendingUp}
                gradient="from-orange-500 to-red-500"
                iconBg="bg-white/20"
                trend="+5%"
                trendUp
                delay={0.2}
              />
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Spinner size="lg" color="primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navbar with glass effect */}
      <Navbar
        isBordered
        className="h-16 backdrop-blur-xl bg-background/80 border-b border-divider"
      >
        <NavbarBrand>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <span className="text-white font-bold text-sm">虾</span>
            </div>
            <div>
              <p className="font-bold text-lg bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                虾湖
              </p>
              <p className="text-xs text-default-400 -mt-1">管理后台</p>
            </div>
          </motion.div>
        </NavbarBrand>
        <NavbarContent justify="end">
          <ThemeSwitch />
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Button variant="light" className="flex items-center gap-2 hover:bg-content2">
                <Avatar
                  name={admin?.username?.charAt(0).toUpperCase()}
                  className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                />
                <p className="hidden md:block font-medium">{admin?.username}</p>
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="用户菜单" className="min-w-[180px]">
              <DropdownItem
                key="settings"
                startContent={<Settings size={18} className="text-default-400" />}
                className="hover:bg-content2"
              >
                <p>设置</p>
              </DropdownItem>
              <DropdownItem
                key="logout"
                color="danger"
                className="text-danger hover:bg-danger-50 dark:hover:bg-danger-900/20"
                startContent={<LogOut size={18} />}
                onPress={handleLogout}
              >
                <p>退出登录</p>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>
      </Navbar>

      <div className="flex flex-1">
        {/* Sidebar with gradient */}
        <motion.aside
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="w-64 admin-sidebar p-4 relative overflow-hidden"
        >
          {/* Decorative blur circles */}
          <div className="absolute top-20 -left-10 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute bottom-40 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl animate-pulse-soft" />

          {/* Logo area */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6 p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/25 relative z-10"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <span className="text-white font-bold text-sm">虾</span>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">虾湖管理</p>
                <p className="text-white/60 text-xs">Admin Panel</p>
              </div>
            </div>
          </motion.div>

          {/* Menu items */}
          <div className="relative z-10">
            <p className="text-slate-400 text-xs font-medium px-3 mb-3">管理员功能</p>
            <nav className="space-y-1">
              {menuItems.map((item, index) => {
                const IconComponent = item.icon;
                const isActive = activeMenu === item.key;
                return (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <button
                      onClick={() => setActiveMenu(item.key)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative group ${
                        isActive
                          ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white"
                          : "text-slate-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="menu-active-indicator"
                        />
                      )}
                      <IconComponent size={20} className={isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-indigo-400"} />
                      <span className="font-medium text-sm">{item.label}</span>
                    </button>
                  </motion.div>
                );
              })}
            </nav>
          </div>
        </motion.aside>

        {/* Main content */}
        <main className="flex-1 p-6 overflow-auto bg-content1">
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}