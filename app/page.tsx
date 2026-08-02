import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CircuitBoard,
  Cpu,
  GraduationCap,
  Layers3,
  ScanLine,
  ShoppingBag,
  Terminal,
} from 'lucide-react';
import { featuredProjects } from '@/lib/content';
import { getBlogEntries, getNoteEntries } from '@/lib/mdx-content';

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
    icon: CircuitBoard,
    label: 'SELECTED WORK',
    title: '查看代表项目',
    description: '从架构选择、验证证据到实测指标，完整呈现 FPGA 与 AI 硬件作品。',
    href: '/showcase',
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

const labAreas = [
  {
    icon: GraduationCap,
    title: '系统学习',
    description: '以可验收项目为主线，建立从 RTL 到工程交付的知识体系。',
    meta: '5 阶段 · 42 核心课时',
    href: '/learn',
  },
  {
    icon: Cpu,
    title: 'IP 与 AI 硬件',
    description: '经过真实项目验证的模块、开发板和边缘智能解决方案。',
    meta: '规格清晰 · 支持集成',
    href: '/products',
  },
  {
    icon: ScanLine,
    title: '工程思想',
    description: '记录器件选型、市场变化，以及技术怎样形成长期复利。',
    meta: 'FPGA · AI · 半导体',
    href: '/blog',
  },
];

export default function HomePage() {
  const latestArticles = getBlogEntries().slice(0, 4);
  const quickNotes = getNoteEntries().slice(0, 4);

  return (
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
              src="/lab-hero.png"
              fill
              priority
              sizes="(max-width: 900px) 92vw, 520px"
              alt="手持 Digilent Genesys 2 FPGA 开发板实拍"
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

      <section className="research-section start-section">
        <div className="research-section-head">
          <div>
            <p className="research-label">START HERE</p>
            <h2>从你关心的问题开始</h2>
          </div>
          <p>文章建立信任，项目证明能力，产品承接真实需求。</p>
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
        <div className="editorial-grid">
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

          <aside className="quick-notes" id="quick-notes">
            <div className="editorial-title-row">
              <div>
                <p className="research-label">QUICK NOTES</p>
                <h2>工程速记</h2>
              </div>
              <Terminal size={20} />
            </div>
            <div className="notes-list">
              {quickNotes.map((note) => (
                <Link href={note.href} key={note.slug}>
                  <div>
                    <span>{note.displayDate}</span>
                    <em>{note.tag}</em>
                  </div>
                  <strong>{note.title}</strong>
                  <ArrowRight size={15} />
                </Link>
              ))}
            </div>
            <div className="notes-status">
              <i />
              <span>
                <strong>MDX 内容库已连接</strong>
                新内容发布后，首页与搜索会自动同步。
              </span>
            </div>
          </aside>
        </div>
      </section>

      <section className="research-section showcase-preview">
        <div className="research-section-head">
          <div>
            <p className="research-label">SELECTED SHOWCASE</p>
            <h2>代表项目</h2>
          </div>
          <Link href="/showcase">查看全部项目 <ArrowRight size={16} /></Link>
        </div>
        <div className="showcase-grid">
          {featuredProjects.map((project, index) => (
            <Link href="/showcase" className={`showcase-card showcase-card-${index + 1}`} key={project.index}>
              <div className="project-visual" aria-hidden="true">
                <div className="project-grid-lines" />
                <div className="project-chip"><Cpu size={28} /></div>
                <span className="project-node node-one" />
                <span className="project-node node-two" />
                <span className="project-node node-three" />
                <div className="project-pulse">
                  {Array.from({ length: 10 }).map((_, pulseIndex) => <i key={pulseIndex} />)}
                </div>
              </div>
              <div className="showcase-card-body">
                <div>
                  <span>{project.type}</span>
                  <em>{project.index}</em>
                </div>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <div className="showcase-metric">
                  <strong>{project.metric}</strong>
                  <span>{project.metricLabel}</span>
                  <ArrowUpRight size={17} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="research-section lab-directory">
        <div className="research-section-head">
          <div>
            <p className="research-label">EXPLORE THE LAB</p>
            <h2>实验室地图</h2>
          </div>
          <p>从内容、系统学习到产品交付，形成一套可以持续生长的工程系统。</p>
        </div>
        <div className="lab-directory-grid">
          {labAreas.map((area) => {
            const AreaIcon = area.icon;
            return (
              <Link href={area.href} key={area.title}>
                <div className="directory-icon"><AreaIcon size={21} /></div>
                <div>
                  <h3>{area.title}</h3>
                  <p>{area.description}</p>
                  <span>{area.meta}</span>
                </div>
                <ArrowUpRight size={17} />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="research-section research-principle">
        <div className="principle-mark">
          <Layers3 size={27} />
          <span />
        </div>
        <div>
          <p className="research-label">ENGINEERING PRINCIPLE</p>
          <h2>真正有影响力的工程能力，<br />必须能被验证、复现和使用。</h2>
        </div>
        <div className="principle-copy">
          <p>
            我不只展示“做出来了”，也公开关键选择、测量依据、失败过程和交付边界。
            这既是工程质量，也是个人品牌最可靠的来源。
          </p>
          <Link href="/guide">阅读工程交付指南 <ArrowRight size={16} /></Link>
        </div>
      </section>
    </div>
  );
}
