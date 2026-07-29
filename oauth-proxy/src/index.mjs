const encoder = new TextEncoder();

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function randomState() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(left, right) {
  if (!left || !right || left.length !== right.length) return false;

  const leftBytes = encoder.encode(left);
  const rightBytes = encoder.encode(right);
  let difference = 0;

  for (let index = 0; index < leftBytes.length; index += 1) {
    difference |= leftBytes[index] ^ rightBytes[index];
  }

  return difference === 0;
}

function readCookie(request, name) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const prefix = `${name}=`;

  for (const part of cookieHeader.split(";")) {
    const cookie = part.trim();
    if (cookie.startsWith(prefix)) {
      return decodeURIComponent(cookie.slice(prefix.length));
    }
  }

  return null;
}

function callbackPage(status, payload) {
  const message = `authorization:github:${status}:${JSON.stringify(payload)}`;
  const safeMessage = JSON.stringify(message).replaceAll("<", "\\u003c");

  return new Response(
    `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>内容后台授权</title>
  </head>
  <body>
    <p>正在连接时工实验室内容后台…</p>
    <script>
      const receiveMessage = () => {
        window.opener?.postMessage(${safeMessage}, "*");
        window.removeEventListener("message", receiveMessage);
      };
      window.addEventListener("message", receiveMessage);
      window.opener?.postMessage("authorizing:github", "*");
    </script>
  </body>
</html>`,
    {
      status: status === "success" ? 200 : 400,
      headers: {
        "content-type": "text/html; charset=utf-8",
        "cache-control": "no-store",
        "content-security-policy":
          "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; frame-ancestors 'none';",
        "referrer-policy": "no-referrer",
        "x-content-type-options": "nosniff",
      },
    },
  );
}

function isConfigured(env) {
  return Boolean(env.GITHUB_OAUTH_ID && env.GITHUB_OAUTH_SECRET);
}

async function authorize(request, env, url) {
  if (url.searchParams.get("provider") !== "github") {
    return json({ error: "unsupported_provider" }, 400);
  }

  if (!isConfigured(env)) {
    return json({ error: "oauth_not_configured" }, 503);
  }

  const state = randomState();
  const scope = env.GITHUB_REPO_PRIVATE === "1" ? "repo,user" : "public_repo,user";
  const callbackUrl = `${url.origin}/callback`;
  const authorizeUrl = new URL("https://github.com/login/oauth/authorize");

  authorizeUrl.search = new URLSearchParams({
    client_id: env.GITHUB_OAUTH_ID,
    redirect_uri: callbackUrl,
    response_type: "code",
    scope,
    state,
  }).toString();

  return new Response(null, {
    status: 302,
    headers: {
      location: authorizeUrl.toString(),
      "cache-control": "no-store",
      "set-cookie": `shi_cms_oauth_state=${encodeURIComponent(state)}; Path=/callback; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
    },
  });
}

async function callback(request, env, url) {
  if (!isConfigured(env)) {
    return callbackPage("error", { message: "OAuth 服务尚未配置。" });
  }

  const state = url.searchParams.get("state");
  const expectedState = readCookie(request, "shi_cms_oauth_state");

  if (!timingSafeEqual(state, expectedState)) {
    return callbackPage("error", { message: "授权状态校验失败，请重新登录。" });
  }

  const oauthError = url.searchParams.get("error");
  const code = url.searchParams.get("code");

  if (oauthError) {
    return callbackPage("error", {
      message: url.searchParams.get("error_description") ?? oauthError,
    });
  }

  if (!code) {
    return callbackPage("error", { message: "GitHub 未返回授权码。" });
  }

  const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "user-agent": "shi-fpga-lab-cms-auth",
    },
    body: JSON.stringify({
      client_id: env.GITHUB_OAUTH_ID,
      client_secret: env.GITHUB_OAUTH_SECRET,
      code,
      redirect_uri: `${url.origin}/callback`,
    }),
  });

  let tokenPayload;
  try {
    tokenPayload = await tokenResponse.json();
  } catch {
    return callbackPage("error", { message: "GitHub 授权响应无法解析。" });
  }

  if (!tokenResponse.ok || !tokenPayload.access_token) {
    return callbackPage("error", {
      message: tokenPayload.error_description ?? tokenPayload.error ?? "GitHub 授权失败。",
    });
  }

  return callbackPage("success", { token: tokenPayload.access_token });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method !== "GET") {
      return json({ error: "method_not_allowed" }, 405);
    }

    if (url.pathname === "/auth") {
      return authorize(request, env, url);
    }

    if (url.pathname === "/callback") {
      return callback(request, env, url);
    }

    if (url.pathname === "/" || url.pathname === "/health") {
      return json({
        service: "shi-fpga-lab-cms-auth",
        status: "ok",
        oauthConfigured: isConfigured(env),
      });
    }

    return json({ error: "not_found" }, 404);
  },
};
