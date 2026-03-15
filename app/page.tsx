"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import Link from "next/link";
import {
  Card,
  CardBody,
  Button,
  Input,
  Select,
  SelectItem,
  Chip,
  Pagination,
  Spinner,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar,
} from "@heroui/react";
import { Search, Flame, Users, Calendar, Plus, User, LogOut } from "lucide-react";
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

export default function Home() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [user, setUser] = useState<{ id: string; username: string; role: string } | null>(null);

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

  const { data, isLoading } = useSWR(
    `/api/tasks?page=${page}&limit=12${status ? `&status=${status}` : ""}${search ? `&search=${encodeURIComponent(search)}` : ""}`,
    fetcher
  );

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

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
                {user.role === "ADMIN" ? (
                  <DropdownItem key="admin">
                    <Link href="/admin">管理后台</Link>
                  </DropdownItem>
                ) : null}
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
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="搜索任务..."
              value={searchInput}
              onValueChange={setSearchInput}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              startContent={<Search size={20} className="text-default-400" />}
            />
            <Button color="primary" onPress={handleSearch}>
              搜索
            </Button>
          </div>
          <Select
            placeholder="状态筛选"
            selectedKeys={status ? [status] : []}
            onSelectionChange={(keys) => {
              setStatus(Array.from(keys)[0] as string || "");
              setPage(1);
            }}
            className="w-40"
          >
            <SelectItem key="">全部</SelectItem>
            <SelectItem key="OPEN">开放</SelectItem>
            <SelectItem key="IN_PROGRESS">进行中</SelectItem>
            <SelectItem key="COMPLETED">已完成</SelectItem>
          </Select>
          {user && (
            <Link href="/publish">
              <Button color="primary" startContent={<Plus size={20} />}>
                发布任务
              </Button>
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Spinner size="lg" />
          </div>
        ) : data?.tasks?.length === 0 ? (
          <div className="text-center py-20 text-default-400">
            暂无任务数据
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data?.tasks?.map((task: any) => (
                <Link key={task.id} href={`/task/${task.id}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <CardBody className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-lg line-clamp-1">{task.title}</h3>
                        <Chip size="sm" color={statusColors[task.status]}>
                          {statusLabels[task.status]}
                        </Chip>
                      </div>
                      <p className="text-default-500 text-sm line-clamp-2 mb-4">
                        {task.description}
                      </p>
                      <div className="flex justify-between items-center text-sm text-default-400">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Flame size={16} className="text-warning" />
                            {task.popularity}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users size={16} />
                            {task.acceptedCount}
                          </span>
                        </div>
                        <span className="flex items-center gap-1">
                          <Calendar size={16} />
                          {new Date(task.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              ))}
            </div>

            {data?.pagination?.totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <Pagination
                  total={data.pagination.totalPages}
                  page={page}
                  onChange={setPage}
                  showControls
                />
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
