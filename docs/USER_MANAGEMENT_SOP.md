# 时工的半导体实验室：用户管理 SOP

## 1. 入口

- 用户注册与登录：网站右上角“登录 / 注册”
- 账号设置：`/account/`
- 管理员用户管理：`/admin/users/`
- 内容管理：`/admin/`

## 2. 首位管理员初始化

为避免公开网站出现“第一个注册者自动成为管理员”的安全风险，所有新注册账号默认都是普通成员。

1. 站长先通过网站右上角完成邮箱注册。
2. 在项目目录运行以下命令，将邮箱替换为站长实际注册邮箱：

```powershell
pnpm exec wrangler d1 execute shi-lab-users --remote --command "UPDATE users SET role = 'admin', updated_at = datetime('now') WHERE email = 'admin@example.com';"
```

3. 退出网站账号并重新登录。
4. 打开 `/admin/users/`，确认能够看到用户列表。

初始化完成后，其他管理员角色都应通过用户管理页面调整。

## 3. 用户管理

- “普通成员”：可以登录和维护自己的昵称、密码。
- “管理员”：可以进入用户管理页，调整其他账号的角色与状态。
- “停用”：立即删除该用户的全部登录会话，之后无法继续登录。

系统禁止管理员在用户管理页停用或降级自己的账号，也禁止停用最后一名启用中的管理员。

## 4. 安全规则

- 不通过聊天、文档或代码传递用户密码。
- 不直接修改 `password_hash`、`password_salt` 或会话记录。
- 用户反馈登录异常时，优先检查账号状态和 Worker 日志。
- 用户数据不进入 GitHub；只保存在 Cloudflare D1。
- 删除用户数据前先确认范围并备份；日常管理优先使用“停用”。

## 5. 发布与数据库迁移

首次部署或新增数据库结构时：

```powershell
pnpm wrangler d1 migrations apply shi-lab-users --remote
pnpm build
pnpm wrangler deploy
```

先应用迁移，再发布依赖新表结构的 Worker。
