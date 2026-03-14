require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaLibSQL } = require("@prisma/adapter-libsql");
const { createClient } = require("@libsql/client");
const bcrypt = require("bcryptjs");

const libsql = createClient({
  url: "file:./prisma/dev.db",
});

const adapter = new PrismaLibSQL(libsql);
const prisma = new PrismaClient({ adapter });

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
