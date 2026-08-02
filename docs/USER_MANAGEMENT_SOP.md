# 时工的半导体实验室：用户管理 SOP

## 1. 入口

- 用户注册与登录：网站右上角“登录 / 注册”
- 邮箱验证页：`/verify-email/`（由验证邮件自动携带令牌）
- 密码重置页：`/reset-password/`（由重置邮件自动携带令牌）
- 账号设置：`/account/`
- 管理员用户管理：`/admin/users/`
- 内容管理：`/admin/`

## 2. 首位管理员初始化

为避免公开网站出现“第一个注册者自动成为管理员”的安全风险，所有新注册账号默认都是普通成员。

1. 站长先通过网站右上角完成邮箱注册并验证邮箱。
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
- “邮箱已验证”：用户已通过一次性邮件链接证明邮箱归属；新注册账号完成验证前不能登录。

系统禁止管理员在用户管理页停用或降级自己的账号，也禁止停用最后一名启用中的管理员。

## 4. 安全规则

- 不通过聊天、文档或代码传递用户密码。
- 不直接修改 `password_hash`、`password_salt` 或会话记录。
- 用户反馈登录异常时，优先检查账号状态和 Worker 日志。
- 用户数据不进入 GitHub；只保存在 Cloudflare D1。
- 验证和重置令牌只以 SHA-256 摘要保存在 D1，链接仅可使用一次。
- 忘记密码接口始终返回相同提示，避免泄露某个邮箱是否已经注册。
- 删除用户数据前先确认范围并备份；日常管理优先使用“停用”。

## 5. 邮件服务配置（Resend）

生产环境需要一个你拥有并可修改 DNS 的域名。`workers.dev` 地址不能作为自有发信域名使用。

1. 在 Resend 添加专用发信子域，例如 `mailer.example.com`。
2. 按 Resend 给出的记录配置 SPF 与 DKIM，等待状态变为 `Verified`。
3. 在 Resend 创建仅用于本站的 API Key。
4. 在项目目录分别运行下面两条命令，并在 Wrangler 的隐藏提示中粘贴真实值：

```powershell
pnpm exec wrangler secret put RESEND_API_KEY
pnpm exec wrangler secret put EMAIL_FROM
```

`EMAIL_FROM` 的示例值：

```text
时工的半导体实验室 <noreply@mailer.example.com>
```

不要把真实 API Key 写入 `.dev.vars.example`、GitHub、聊天或 SOP。需要在本地调试时，将 `.dev.vars.example` 复制为 `.dev.vars`；`EMAIL_DEBUG_CAPTURE=true` 只在 localhost 生效，生产环境不会返回明文令牌。

## 6. 用户操作流程

### 注册与验证

1. 用户在右上角选择“注册账号”并填写邮箱、昵称与密码。
2. 系统发送 24 小时有效的一次性验证链接。
3. 用户点击链接后自动完成验证并登录。
4. 未收到邮件时，可在登录界面重发；同一 IP 与邮箱 15 分钟最多发送 3 次。

### 忘记密码

1. 在邮箱登录界面点击“忘记密码？”。
2. 填写注册邮箱，系统发送 30 分钟有效的一次性链接。
3. 设置新密码后，其他设备的旧会话会全部退出，当前设备自动登录。

## 7. 发布与数据库迁移

发布前先确认 `RESEND_API_KEY` 和 `EMAIL_FROM` 已经写入目标 Worker 的 Secrets。首次部署或新增数据库结构时：

```powershell
pnpm exec wrangler d1 migrations apply shi-lab-users --remote
pnpm build
pnpm exec wrangler deploy
```

先应用迁移，再发布依赖新表结构的 Worker。

## 8. 发布后验收

使用一个可收信、尚未注册的新邮箱完成以下检查：

1. 注册后不能在验证前登录。
2. 验证邮件中的链接能够完成登录，后台显示“邮箱已验证”。
3. “忘记密码”邮件可以打开重置页面。
4. 新密码可以登录，旧密码不能登录，同一个重置链接不能重复使用。
5. 在 Cloudflare Worker 日志确认没有 `verification_email_failed` 或 `password_reset_email_failed`。
