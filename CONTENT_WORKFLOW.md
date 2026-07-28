# 时工实验室内容发布工作流

## 日常更新

在项目目录运行：

```powershell
pnpm content:studio
```

然后打开 `http://localhost:3000/admin/`。后台包含“工程文章”和“工程速记”两个内容库：

- 保存 MDX 文件后，开发页面会自动刷新。
- `draft: true` 的内容不会出现在网站、搜索或 sitemap。
- 关闭“草稿”并保存后，首页会按 `date` 自动更新。
- `featured: true` 的文章成为博客首页主推文章。

也可以直接编辑：

- `content/blog/*.mdx`
- `content/notes/*.mdx`

## 自动发布

仓库已包含 `.github/workflows/deploy.yml`。GitHub `main` 分支收到内容提交后会：

1. 安装锁定版本的依赖；
2. 构建并验证全部 MDX 页面；
3. 使用 Wrangler 发布到 Cloudflare Workers。

GitHub 仓库需要配置两个 Actions Secret：

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## 一次性接通远程后台

`public/admin/config.yml` 已连接 `calvinee/Ethan-labe-web`。远程后台还需替换：

- `https://REPLACE_WITH_OAUTH_PROXY`：Decap GitHub OAuth 代理地址。

OAuth 代理需要处理 `/auth` 与 `/callback`，并将 GitHub OAuth App 的 Client ID / Secret 保存为 Cloudflare Secret，不能写入仓库。
