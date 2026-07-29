'use client';

import { ArrowRight, Check } from 'lucide-react';
import { useState, type FormEvent } from 'react';

export function JoinForm() {
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return;
    setJoined(true);
  };

  if (joined) {
    return (
      <div className="join-success" role="status">
        <Check size={19} />
        <span>
          <strong>订阅已记录</strong>
          <small>实验室信号将在下一期发出。</small>
        </span>
      </div>
    );
  }

  return (
    <form className="join-form" onSubmit={submit}>
      <label htmlFor="newsletter-email" className="sr-only">邮箱地址</label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="你的邮箱地址"
      />
      <button type="submit">
        订阅简报 <ArrowRight size={16} />
      </button>
      <small>提交即表示你同意仅接收实验室内容邮件。</small>
    </form>
  );
}
