require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: "admin@xiahu.com" },
  });

  if (existingAdmin) {
    console.log("超级管理员账号已存在");
    return;
  }

  const hashedPassword = await bcrypt.hash("admin123456", 10);

  const admin = await prisma.admin.create({
    data: {
      email: "admin@xiahu.com",
      username: "admin",
      password: hashedPassword,
    },
  });

  console.log("超级管理员账号创建成功:", {
    id: admin.id,
    email: admin.email,
    username: admin.username,
  });
}

main()
  .catch((e) => {
    console.error("创建超级管理员失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
