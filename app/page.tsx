import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  BrainCircuit,
  ShoppingBag,
} from 'lucide-react';
import { homeVisualSettings } from '@/lib/home-visuals';
import { getBlogEntries } from '@/lib/mdx-content';
import { CredentialsStrip } from '@/components/credentials-strip';
import { GitHubShowcase } from '@/components/github-showcase';
import { HomeVisualFrame } from '@/components/home-visual-frame';

const startHere = [
  {
    icon: BookOpen,
    label: 'BEST ARTICLES',
    title: '从工程文章开始',
    description: '阅读项目复盘、设计方法与行业判断，了解我怎样拆解真实问题。',
    href: '/blog',
    accent: 'blue',
  },
  {
    icon: BrainCircuit,
    label: 'MIND MAPS',
    title: '查看思维导图',
    description: '把复杂系统拆成可理解、可复用的判断路径，快速建立工程全局观。',
    href: '/blog#mindmaps',
    accent: 'violet',
  },
  {
    icon: ShoppingBag,
    label: 'PRODUCT & SERVICE',
    title: '把能力变成产品',
    description: '浏览可交付 IP、PCB、AI 硬件，以及面向企业的方案设计服务。',
    href: '/products',
    accent: 'cyan',
  },
];

export default function HomePage() {
  const latestArticles = getBlogEntries().slice(0, 4);

  return (
    <HomeVisualFrame settings={homeVisualSettings}>
      <div className="research-home">
      <section className="research-hero">
        <div className="research-hero-copy">
          <p className="research-kicker">
            <span />
            FPGA ENGINEER · AI HARDWARE BUILDER
          </p>
          <h1>
            你好，我是时工。
            <br />
            我把工程问题做成
            <em>作品、文章与产品。</em>
          </h1>
          <p className="research-intro">
            欢迎来到时工的半导体实验室。这里记录 FPGA、边缘 AI 与 PCB
            产品从想法到交付的全过程，也分享我对技术路线和半导体市场的长期判断。
          </p>
          <div className="research-hero-actions">
            <Link href="/blog" className="research-button research-button-primary">
              从这里开始 <ArrowRight size={17} />
            </Link>
            <Link href="/showcase" className="research-button research-button-ghost">
              浏览 Showcase <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="research-topics" aria-label="主要研究方向">
            <span>Xilinx</span>
            <span>安路 FPGA</span>
            <span>Edge AI</span>
            <span>PCB Design</span>
          </div>
        </div>

        <div className="research-hero-visual">
          <div className="portrait-orbit orbit-outer" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <div className="portrait-orbit orbit-inner" aria-hidden="true">
            <i />
            <i />
          </div>
          <div className="lab-portrait">
            <Image
              src={homeVisualSettings.heroImage}
              fill
              priority
              sizes="(max-width: 900px) 92vw, 520px"
              alt={homeVisualSettings.heroAlt}
            />
            <div className="portrait-scan" aria-hidden="true" />
            <div className="portrait-caption">
              <span>SHI LAB / BENCH 01</span>
              <strong>GENESYS 2 · KINTEX-7</strong>
            </div>
          </div>

          <div className="live-scope" aria-label="动态逻辑波形状态">
            <div className="live-scope-head">
              <span><i /> LIVE SIGNAL</span>
              <code>100.000 MHz</code>
            </div>
            <div className="scope-trace" aria-hidden="true">
              {Array.from({ length: 18 }).map((_, index) => <i key={index} />)}
            </div>
            <div className="scope-foot">
              <span>LOCKED</span>
              <span>0 ERROR</span>
              <span>28°C</span>
            </div>
          </div>
        </div>
      </section>

      <div className="research-signal-strip" aria-hidden="true">
        <div className="signal-track">
          {[0, 1].map((copy) => (
            <div key={copy}>
              <span>BUILD</span><i />
              <span>VERIFY</span><i />
              <span>MEASURE</span><i />
              <span>SHARE</span><i />
              <span>FPGA</span><i />
              <span>EDGE AI</span><i />
            </div>
          ))}
        </div>
      </div>

      <GitHubShowcase compact />

      <CredentialsStrip credentials={homeVisualSettings.credentials} />

      <section className="research-section start-section">
        <div className="research-section-head">
          <div>
            <p className="research-label">START HERE</p>
            <h2>从你关心的问题开始</h2>
          </div>
          <p>文章沉淀工程判断，导图梳理复杂系统，产品承接真实需求。</p>
        </div>
        <div className="start-grid">
          {startHere.map((item) => {
            const ItemIcon = item.icon;
            return (
              <Link href={item.href} className={`start-card start-card-${item.accent}`} key={item.title}>
                <div className="start-card-top">
                  <ItemIcon size={21} />
                  <span>{item.label}</span>
                  <ArrowUpRight size={17} />
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="research-section editorial-section">
        <div className="latest-writing">
          <div className="editorial-title-row">
            <div>
              <p className="research-label">RECENT WRITING</p>
              <h2>最新文章</h2>
            </div>
            <Link href="/blog">全部文章 <ArrowRight size={15} /></Link>
          </div>
          <div className="writing-list">
            {latestArticles.map((article) => (
              <Link href={article.href} className="writing-row" key={article.slug}>
                <div className="writing-date">
                  <strong>{article.date.slice(5).replace('-', '.')}</strong>
                  <span>{article.date.slice(0, 4)}</span>
                </div>
                <div className="writing-copy">
                  <span>{article.category}</span>
                  <h3>{article.title}</h3>
                  <p>{article.description}</p>
                </div>
                <ArrowUpRight size={18} />
              </Link>
            ))}
          </div>
        </div>
      </section>
      </div>
    </HomeVisualFrame>
  );
}
