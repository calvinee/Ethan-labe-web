# 时工的半导体实验室

面向 FPGA 与 AI 硬件工程师的个人技术网站，包含工程文章、项目展示、产品服务、系统学习、工程工具和工程速记。

- 网站：[shi-fpga-lab.shi-fpga-lab.workers.dev](https://shi-fpga-lab.shi-fpga-lab.workers.dev/)
- 内容后台：[网站 /admin](https://shi-fpga-lab.shi-fpga-lab.workers.dev/admin/)
- 内容工作流：[CONTENT_WORKFLOW.md](./CONTENT_WORKFLOW.md)
- 内容更新 SOP：[docs/CONTENT_UPDATE_SOP.md](./docs/CONTENT_UPDATE_SOP.md)

## 本地开发

```powershell
pnpm install --frozen-lockfile
pnpm dev
```

启动可视化内容后台：

```powershell
pnpm content:studio
```

然后访问 `http://localhost:3000/admin/`。

## 内容与发布结构

- `content/blog/*.mdx`：工程文章
- `content/notes/*.mdx`：工程速记
- `content/products/*.mdx`：产品项目
- `content/learn/*.mdx`：系统学习
- `content/tools/*.mdx`：工程工具目录与说明
- `public/admin/config.yml`：可视化后台字段与 GitHub 内容库连接
- `oauth-proxy/`：内容后台的 GitHub OAuth Cloudflare Worker
- `.github/workflows/deploy.yml`：网站与 OAuth 代理的 Cloudflare 自动发布

关闭 MDX frontmatter 中的 `draft` 后，内容会自动进入首页、博客列表、站内搜索与 sitemap。
