# 时工实验室内容发布工作流

## 日常更新

在项目目录运行：

```powershell
pnpm content:studio
```

然后打开 `http://localhost:3000/admin/`。后台包含网站与首页、工程文章、思维导图、工程速记、产品项目和系统学习内容库：

- 保存 MDX 文件后，开发页面会自动刷新。
- `draft: true` 的内容不会出现在网站、搜索或 sitemap。
- 关闭“草稿”并保存后，首页会按 `date` 自动更新“最新文章”或“工程速记”。
- `featured: true` 的文章成为博客首页主推文章。

也可以直接编辑：

- `content/blog/*.mdx`
- `content/notes/*.mdx`
- `content/products/*.mdx`
- `content/learn/*.mdx`
- `content/mindmaps/*.mdx`
- `content/settings/home.json`

完整编辑、审核、发布和回滚步骤见：

- `docs/CONTENT_UPDATE_SOP.md`

## 远程内容后台

生产后台：

- `https://shi-fpga-lab.shi-fpga-lab.workers.dev/admin/`

`public/admin/config.yml` 已连接 `calvinee/Ethan-labe-web`，OAuth 代理为：

- `https://shi-fpga-lab-cms-auth.shi-fpga-lab.workers.dev`

代理源码位于 `oauth-proxy/`，负责 `/auth` 和 `/callback`。GitHub OAuth App 的 Client ID / Secret 只保存在 Cloudflare Secrets，不写入仓库。使用 GitHub 登录后即可新建、预览和发布 MDX 内容。

## 自动发布

仓库中的 `.github/workflows/deploy.yml` 会在 GitHub `main` 分支收到提交后：

1. 安装锁定版本的依赖；
2. 构建并验证全部 MDX 页面；
3. 使用 Wrangler 发布网站与 CMS OAuth 代理到 Cloudflare Workers。

GitHub 仓库需要以下 Actions Secrets：

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`

可视化后台发布文章，本质上是向 `main` 分支提交 MDX；提交成功后，GitHub Actions 会自动构建并上线。

## 注册用户管理

- 邮箱注册与登录入口：网站右上角“登录 / 注册”
- 账号中心：`/account/`
- 用户管理：`/admin/users/`
- 用户与会话数据：Cloudflare D1 数据库 `shi-lab-users`

用户管理页只允许 `admin` 角色访问。首次部署后，先注册站长账号，再按照
`docs/USER_MANAGEMENT_SOP.md` 完成一次管理员初始化。
