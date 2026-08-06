'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowUpRight,
  ChevronRight,
  Command,
  Menu,
  Moon,
  Search,
  Sun,
  X,
} from 'lucide-react';
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { navItems } from '@/lib/content';
import type { SearchItem } from '@/lib/mdx-content';
import { AuthPanel } from './auth-panel';
import { BrandMark } from './brand-mark';

export function SiteShell({
  children,
  searchItems,
}: {
  children: ReactNode;
  searchItems: SearchItem[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const magazineMode =
    pathname.startsWith('/blog') ||
    pathname.startsWith('/notes') ||
    pathname.startsWith('/guide');
  const searchRef = useRef<HTMLInputElement>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('shi-lab-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const nextTheme = saved === 'dark' || (!saved && prefersDark) ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setSearchOpen((value) => !value);
      }
      if (event.key === 'Escape') {
        setSearchOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    if (searchOpen) {
      window.setTimeout(() => searchRef.current?.focus(), 40);
    } else {
      setQuery('');
    }
  }, [searchOpen]);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return searchItems.slice(0, 8);
    return searchItems
      .filter((item) =>
        `${item.title}${item.description}${item.group}`.toLowerCase().includes(normalized),
      )
      .slice(0, 10);
  }, [query, searchItems]);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem('shi-lab-theme', next);
  };

  const openResult = (href: string) => {
    setSearchOpen(false);
    router.push(href);
  };

  return (
    <>
      <div className="signal-line" />
      <header className={`site-header ${magazineMode ? 'magazine-shell-header' : ''}`}>
        <div className={`header-inner ${magazineMode ? 'magazine-shell-inner' : ''}`}>
          <Link href="/" className="brand" aria-label="时工的半导体实验室首页">
            <BrandMark variant={magazineMode ? 'journal' : 'main'} />
            <span className="brand-copy">
              <strong>{magazineMode ? '时工工程杂志' : '时工的半导体实验室'}</strong>
              <small>{magazineMode ? 'SHI LAB JOURNAL' : "SHI'S SEMICONDUCTOR LAB"}</small>
            </span>
          </Link>

          <nav className="desktop-nav" aria-label="主导航">
            {navItems.map((item) => (
              <Link
                href={item.href}
                key={item.href}
                className={pathname.startsWith(item.href) ? 'active' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="header-actions">
            <button className="search-trigger" onClick={() => setSearchOpen(true)}>
              <Search size={16} />
              <span>搜索</span>
              <kbd>
                <Command size={11} /> K
              </kbd>
            </button>
            <AuthPanel />
            <button className="icon-button" onClick={toggleTheme} aria-label="切换明暗主题">
              {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
            </button>
            <button
              className="icon-button mobile-menu-button"
              onClick={() => setMobileOpen(true)}
              aria-label="打开菜单"
            >
              <Menu size={19} />
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="mobile-panel" role="dialog" aria-modal="true" aria-label="移动端导航">
          <div className="mobile-panel-head">
            <Link href="/" className="brand">
              <BrandMark variant={magazineMode ? 'journal' : 'main'} />
              <span className="brand-copy">
                <strong>{magazineMode ? '时工工程杂志' : '时工的半导体实验室'}</strong>
                <small>{magazineMode ? 'SHI LAB JOURNAL' : 'SEMICONDUCTOR LAB'}</small>
              </span>
            </Link>
            <button className="icon-button" onClick={() => setMobileOpen(false)} aria-label="关闭菜单">
              <X size={19} />
            </button>
          </div>
          <button
            className="mobile-search"
            onClick={() => {
              setMobileOpen(false);
              setSearchOpen(true);
            }}
          >
            <Search size={17} />
            搜索文章、产品与课程
          </button>
          <nav className="mobile-nav">
            {navItems.map((item, index) => (
              <Link href={item.href} key={item.href}>
                <span className="mobile-index">{String(index + 1).padStart(2, '0')}</span>
                <item.icon size={20} />
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.short}</small>
                </span>
                <ChevronRight size={17} />
              </Link>
            ))}
          </nav>
          <div className="mobile-panel-foot">
            <span>BUILD · VERIFY · SHARE</span>
            <span>© 2026 SHI LAB</span>
          </div>
        </div>
      )}

      {searchOpen && (
        <div className="search-overlay" role="dialog" aria-modal="true" aria-label="全站搜索">
          <button
            className="search-backdrop"
            onClick={() => setSearchOpen(false)}
            aria-label="关闭搜索"
          />
          <div className="search-dialog">
            <div className="search-input-row">
              <Search size={20} />
              <input
                ref={searchRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="搜索文章、IP 核或系统课程…"
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && results[0]) openResult(results[0].href);
                }}
              />
              <kbd>ESC</kbd>
            </div>
            <div className="search-results">
              <p className="search-caption">
                {query ? `找到 ${results.length} 个结果` : '快速访问'}
              </p>
              {results.length > 0 ? (
                results.map((item) => (
                  <button key={`${item.href}-${item.title}`} onClick={() => openResult(item.href)}>
                    <span className="search-result-icon">
                      <Search size={15} />
                    </span>
                    <span>
                      <strong>{item.title}</strong>
                      <small>{item.description}</small>
                    </span>
                    <em>{item.group}</em>
                    <ArrowUpRight size={15} />
                  </button>
                ))
              ) : (
                <div className="search-empty">
                  <span>∅</span>
                  <strong>没有匹配的内容</strong>
                  <p>换一个更短的关键词试试，例如“AXI”或“安路”。</p>
                </div>
              )}
            </div>
            <div className="search-footer">
              <span>
                <kbd>↵</kbd> 打开
              </span>
              <span>
                <kbd>ESC</kbd> 关闭
              </span>
              <span className="search-brand">SHI LAB SEARCH</span>
            </div>
          </div>
        </div>
      )}

      <main className="site-main">{children}</main>

      <footer className={`site-footer ${magazineMode ? 'magazine-shell-footer' : ''}`}>
        <div className="footer-grid">
          <div className="footer-brand">
            <BrandMark />
            <div>
              <strong>时工的半导体实验室</strong>
              <p>从一个工程问题，到一件真正可交付的产品。</p>
            </div>
          </div>
          <div className="footer-links">
            <div>
              <span>探索</span>
              <Link href="/blog">工程博客</Link>
              <Link href="/showcase">代表项目</Link>
              <Link href="/learn">系统学习</Link>
            </div>
            <div>
              <span>产品</span>
              <Link href="/products">产品项目</Link>
              <Link href="/account">账号中心</Link>
              <Link href="/guide">交付指南</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 SHI&apos;S SEMICONDUCTOR LAB</span>
          <span className="system-status">
            <i /> LAB SYSTEM ONLINE
          </span>
          <span>MADE FOR FPGA ENGINEERS</span>
        </div>
      </footer>
    </>
  );
}
