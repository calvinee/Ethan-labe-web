# 内容后台 OAuth 代理

这个独立 Cloudflare Worker 为 Decap CMS 完成 GitHub OAuth 登录，不保存文章或访问令牌。

生产地址：

- `https://shi-fpga-lab-cms-auth.shi-fpga-lab.workers.dev`

GitHub OAuth App 使用以下地址：

- Homepage URL：`https://shi-fpga-lab-cms-auth.shi-fpga-lab.workers.dev`
- Authorization callback URL：`https://shi-fpga-lab-cms-auth.shi-fpga-lab.workers.dev/callback`

首次部署后，将 OAuth App 生成的值写入 Cloudflare Secret：

```powershell
pnpm exec wrangler secret put GITHUB_OAUTH_ID --config oauth-proxy/wrangler.jsonc
pnpm exec wrangler secret put GITHUB_OAUTH_SECRET --config oauth-proxy/wrangler.jsonc
```

本仓库是公开仓库，`GITHUB_REPO_PRIVATE` 保持为 `0`，授权范围使用 `public_repo,user`。
