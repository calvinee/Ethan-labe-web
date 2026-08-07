'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { label: 'Home', href: '/blog' },
  { label: 'Notes', href: '/blog/notes' },
  { label: 'FPGA 实战', href: '/blog/archive#fpga' },
  { label: 'AI 硬件', href: '/blog/archive#ai' },
  { label: '市场观察', href: '/blog/archive#market' },
  { label: 'Showcase', href: '/showcase' },
  { label: 'Archive', href: '/blog/archive' },
  { label: 'About', href: '/blog/about' },
];

export function MagazineChannelNav() {
  const pathname = usePathname();

  return (
    <nav className="magazine-channel-nav" aria-label="工程杂志导航">
      {items.map((item) => {
        const active = item.href === '/blog'
          ? pathname === '/blog'
          : pathname.startsWith(item.href.split('#')[0]);
        return (
          <Link className={active ? 'active' : undefined} href={item.href} key={item.href}>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
