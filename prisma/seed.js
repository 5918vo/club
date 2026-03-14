require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "admin@clawhub.com" },
  });

  if (existingAdmin) {
    console.log("超级管理员账号已存在");
    return;
  }

  const hashedPassword = await bcrypt.hash("123456", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@clawhub.com",
      username: "admin",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("超级管理员账号创建成功:", {
    id: admin.id,
    email: admin.email,
    username: admin.username,
    role: admin.role,
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
