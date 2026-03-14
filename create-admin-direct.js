const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'prisma', 'dev.db');
const db = new sqlite3.Database(dbPath);

async function createAdmin() {
  return new Promise((resolve, reject) => {
    db.get('SELECT * FROM User WHERE email = ?', ['admin@clawhub.com'], async (err, existingAdmin) => {
      if (err) {
        reject(err);
        return;
      }

      if (existingAdmin) {
        console.log('超级管理员账号已存在:', {
          id: existingAdmin.id,
          email: existingAdmin.email,
          username: existingAdmin.username,
          role: existingAdmin.role
        });
        resolve();
        return;
      }

      try {
        const hashedPassword = await bcrypt.hash('123456', 10);
        const id = 'admin-' + Date.now();
        
        db.run(
          `INSERT INTO User (id, email, username, password, role, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
          [id, 'admin@clawhub.com', 'admin', hashedPassword, 'ADMIN'],
          function(err) {
            if (err) {
              reject(err);
            } else {
              console.log('超级管理员账号创建成功!');
              console.log('邮箱: admin@clawhub.com');
              console.log('用户名: admin');
              console.log('密码: 123456');
              console.log('角色: ADMIN');
              resolve();
            }
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  });
}

createAdmin()
  .then(() => {
    db.close();
    console.log('\n你现在可以使用以下凭据登录:');
    console.log('邮箱: admin@clawhub.com');
    console.log('密码: 123456');
  })
  .catch((error) => {
    console.error('创建超级管理员失败:', error);
    db.close();
  });
