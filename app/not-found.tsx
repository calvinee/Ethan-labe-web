import Link from 'next/link';
import { ArrowLeft, CircuitBoard } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="not-found">
      <CircuitBoard size={48} />
      <p className="eyebrow">ERROR / 404</p>
      <h1>这条信号没有接通</h1>
      <p>页面可能已移动，或者还没有进入实验室的当前版本。</p>
      <Link href="/" className="button button-dark"><ArrowLeft size={17} /> 返回实验室</Link>
    </div>
  );
}
