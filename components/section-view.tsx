'use client';

import Link from 'next/link';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  Clock3,
  CircuitBoard,
  Code2,
  Cpu,
  Filter,
  Gauge,
  Layers3,
  MessageSquareText,
  PackageCheck,
  PackageOpen,
  Radio,
  Rocket,
  ScanLine,
  Send,
  ShieldCheck,
  Sparkles,
  Users,
  Boxes,
  type LucideIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { sectionContent, type ContentCard } from '@/lib/content';
import type { ManagedEntry } from '@/lib/mdx-content';

const managedIconMap: Record<ManagedEntry['icon'], LucideIcon> = {
  cpu: Cpu,
  radio: Radio,
  board: CircuitBoard,
  layers: Layers3,
  code: Code2,
  scan: ScanLine,
  gauge: Gauge,
  rocket: Rocket,
  package: PackageOpen,
  boxes: Boxes,
};

export function SectionView({
  slug,
  managedCards,
}: {
  slug: string;
  managedCards?: ManagedEntry[];
}) {
  const content = sectionContent[slug];
  const [activeFilter, setActiveFilter] = useState(content.filters[0]);
  const stats = managedCards?.length
    ? content.stats.map((stat, index) => (
        index === 0 ? { ...stat, value: String(managedCards.length) } : stat
      ))
    : content.stats;

  const cards = useMemo(() => {
    const sourceCards: ContentCard[] = managedCards?.length
      ? managedCards.map((card) => ({
          eyebrow: card.eyebrow,
          title: card.title,
          description: card.description,
          meta: card.meta,
          href: card.href,
          icon: managedIconMap[card.icon],
          status: card.status,
          price: card.price || undefined,
          tags: card.tags,
        }))
      : content.cards;
    if (activeFilter === content.filters[0]) return sourceCards;
    const keyword = activeFilter.replace('全部', '');
    const matched = sourceCards.filter((card) =>
      `${card.title}${card.eyebrow}${card.description}${card.tags?.join('')}`.includes(keyword),
    );
    return matched.length > 0 ? matched : sourceCards;
  }, [activeFilter, content, managedCards]);

  return (
    <div className="section-page" style={{ '--section-accent': content.accent } as React.CSSProperties}>
      <section className="section-hero">
        <div className="section-hero-noise" />
        <div className="section-hero-copy">
          <p className="eyebrow">{content.eyebrow}</p>
          <h1>{content.title}</h1>
          <p>{content.description}</p>
          <div className="section-stats">
            {stats.map((stat) => (
              <div key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="section-hero-art">
          <div className="art-orbit orbit-one" />
          <div className="art-orbit orbit-two" />
          <div className="art-core"><content.icon size={34} /></div>
          <div className="art-label label-a">INPUT</div>
          <div className="art-label label-b">VERIFY</div>
          <div className="art-label label-c">OUTPUT</div>
          <svg viewBox="0 0 420 120" preserveAspectRatio="none">
            <path d="M0 78h55V28h48v50h48V54h52v24h42V18h50v60h53V43h46v35h26" />
          </svg>
        </div>
      </section>

      {cards.length > 0 && (
        <section className="section section-content">
          <div className="filter-row">
            <div className="filter-label"><Filter size={15} /> FILTER</div>
            <div className="filter-tabs">
              {content.filters.map((filter) => (
                <button
                  className={activeFilter === filter ? 'active' : undefined}
                  onClick={() => setActiveFilter(filter)}
                  key={filter}
                >
                  {filter}
                </button>
              ))}
            </div>
            <span>{String(cards.length).padStart(2, '0')} ITEMS</span>
          </div>

          <div className={`content-card-grid ${slug === 'community' ? 'forum-grid' : ''}`}>
            {cards.map((card, index) => {
              const CardIcon = card.icon ?? Sparkles;
              const target = card.href ?? (slug === 'products' ? '/partners' : `/${slug}`);
              return (
                <Link href={target} className="content-card" key={card.title}>
                  <div className="content-card-head">
                    <span className="content-card-number">{String(index + 1).padStart(2, '0')}</span>
                    <CardIcon size={22} />
                    {card.status && <em>{card.status}</em>}
                  </div>
                  <p className="card-eyebrow">{card.eyebrow}</p>
                  <h2>{card.title}</h2>
                  <p className="card-description">{card.description}</p>
                  <div className="card-tags">
                    {card.tags?.map((tag) => <span key={tag}>{tag}</span>)}
                  </div>
                  <div className="content-card-foot">
                    <span>{card.price ?? card.meta}</span>
                    <ArrowUpRight size={18} />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {slug === 'products' && <ProductPromise />}
      {slug === 'community' && <CommunityRules />}
      {slug === 'learn' && <LearningMethod />}
      {slug === 'partners' && <PartnerCall />}
    </div>
  );
}

function ProductPromise() {
  return (
    <section className="section promise-grid">
      <div>
        <p className="eyebrow">DELIVERY STANDARD</p>
        <h2>卖的不只是代码，<br />而是可集成的确定性</h2>
      </div>
      {[
        [PackageCheck, '清晰交付物', '源码或网表、规格文档、仿真环境和集成示例在购买前写清楚。'],
        [ShieldCheck, '项目验证', '公开适用器件、资源占用、时序条件与已验证场景，不夸大边界。'],
        [Clock3, '持续支持', '提供约定周期内的集成答疑、缺陷修复与版本更新记录。'],
      ].map(([Icon, title, description]) => {
        const PromiseIcon = Icon as typeof PackageCheck;
        return (
          <div className="promise-card" key={title as string}>
            <PromiseIcon size={22} />
            <strong>{title as string}</strong>
            <p>{description as string}</p>
          </div>
        );
      })}
    </section>
  );
}

function CommunityRules() {
  return (
    <section className="section rules-section">
      <div className="rules-copy">
        <p className="eyebrow">CIRCLE PROTOCOL</p>
        <h2>让每次讨论都能<br />留下可检索的结论</h2>
        <p>技术圈不是聊天群的搬运。我们用最少的规则保护所有人的时间。</p>
      </div>
      <ol>
        {[
          ['问题带上下文', '器件、工具版本、约束、现象和已经尝试的步骤。'],
          ['结论带依据', '仿真、测量、文档章节或可复现工程。'],
          ['解决后沉淀', '补充最终原因、修改内容和验证结果。'],
        ].map(([title, description], index) => (
          <li key={title}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <div><strong>{title}</strong><p>{description}</p></div>
            <Check size={18} />
          </li>
        ))}
      </ol>
    </section>
  );
}

function LearningMethod() {
  return (
    <section className="section method-section">
      <div className="method-head">
        <p className="eyebrow">HOW IT WORKS</p>
        <h2>每一阶段都闭环</h2>
      </div>
      <div className="method-flow">
        {[
          ['01', '建立模型', '先回答“为什么”'],
          ['02', '完成设计', '再亲手写出来'],
          ['03', '设计验证', '用数据证明正确'],
          ['04', '公开表达', '让别人能复现'],
        ].map(([index, title, description], itemIndex) => (
          <div key={title}>
            <span>{index}</span>
            <strong>{title}</strong>
            <p>{description}</p>
            {itemIndex < 3 && <ChevronRight size={19} />}
          </div>
        ))}
      </div>
    </section>
  );
}

function PartnerCall() {
  return (
    <section className="section partner-call">
      <div>
        <span className="partner-call-icon"><Users size={26} /></span>
        <p className="eyebrow">OPEN CALL / 2026 Q3</p>
        <h2>正在寻找：懂高速采集、<br />嵌入式 Linux 与工业算法的伙伴</h2>
        <p>请用一页文字介绍你擅长的问题、做过的项目和希望参与的方向。作品链接比头衔更重要。</p>
      </div>
      <a className="button button-light" href="mailto:partner@shilab.example">
        发送合作介绍 <Send size={17} />
      </a>
    </section>
  );
}
