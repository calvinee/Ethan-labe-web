type AuthEmailPurpose = 'verify_email' | 'reset_password';

type AuthEmailInput = {
  purpose: AuthEmailPurpose;
  recipient: string;
  token: string;
  origin: string;
  idempotencyKey: string;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function emailContent(input: AuthEmailInput): {
  subject: string;
  html: string;
  text: string;
} {
  const verify = input.purpose === 'verify_email';
  const path = verify ? '/verify-email/' : '/reset-password/';
  const actionUrl = `${input.origin}${path}?token=${encodeURIComponent(input.token)}`;
  const safeUrl = escapeHtml(actionUrl);
  const title = verify ? '验证你的实验室邮箱' : '重置你的实验室密码';
  const description = verify
    ? '完成邮箱验证后，即可登录时工的半导体实验室。'
    : '我们收到了重置密码的请求。此链接将在 30 分钟后失效。';
  const button = verify ? '验证邮箱' : '重置密码';
  const expiry = verify ? '验证链接将在 24 小时后失效。' : '重置链接将在 30 分钟后失效。';

  return {
    subject: `【时工的半导体实验室】${title}`,
    html: `<!doctype html>
<html lang="zh-CN">
  <body style="margin:0;background:#f4f7fb;color:#172033;font-family:Arial,'Microsoft YaHei',sans-serif">
    <div style="max-width:600px;margin:0 auto;padding:40px 20px">
      <div style="border-top:4px solid #2563eb;background:#ffffff;padding:36px;border-radius:10px;box-shadow:0 16px 48px rgba(31,63,112,.10)">
        <p style="margin:0 0 18px;color:#2563eb;font-size:11px;font-weight:700;letter-spacing:.12em">SHI'S SEMICONDUCTOR LAB</p>
        <h1 style="margin:0 0 12px;font-size:28px;line-height:1.25">${title}</h1>
        <p style="margin:0 0 26px;color:#526077;font-size:15px;line-height:1.8">${description}</p>
        <a href="${safeUrl}" style="display:inline-block;padding:13px 22px;border-radius:6px;background:#2563eb;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700">${button}</a>
        <p style="margin:28px 0 8px;color:#7f8ca3;font-size:12px;line-height:1.7">${expiry}如果不是你发起的请求，可以忽略这封邮件。</p>
        <p style="margin:0;color:#7f8ca3;font-size:11px;line-height:1.6;word-break:break-all">按钮无法打开时，请复制此链接：<br>${safeUrl}</p>
      </div>
    </div>
  </body>
</html>`,
    text: `${title}

${description}

${button}：${actionUrl}

${expiry}如果不是你发起的请求，可以忽略这封邮件。`,
  };
}

export function isLocalEmailCapture(request: Request, env: Env): boolean {
  const hostname = new URL(request.url).hostname;
  return (
    env.EMAIL_DEBUG_CAPTURE === 'true' &&
    (hostname === '127.0.0.1' || hostname === 'localhost')
  );
}

export async function sendAuthEmail(
  request: Request,
  env: Env,
  input: Omit<AuthEmailInput, 'origin'>,
): Promise<void> {
  if (isLocalEmailCapture(request, env)) return;
  if (!env.RESEND_API_KEY || !env.EMAIL_FROM) {
    throw new Error('email_service_not_configured');
  }

  const content = emailContent({
    ...input,
    origin: new URL(request.url).origin,
  });
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.RESEND_API_KEY}`,
      'content-type': 'application/json',
      'idempotency-key': input.idempotencyKey,
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: [input.recipient],
      subject: content.subject,
      html: content.html,
      text: content.text,
      tags: [
        { name: 'product', value: 'shi-lab' },
        { name: 'purpose', value: input.purpose },
      ],
    }),
  });

  if (!response.ok) {
    await response.body?.cancel();
    throw new Error(`email_delivery_failed_${response.status}`);
  }
  await response.body?.cancel();
}
