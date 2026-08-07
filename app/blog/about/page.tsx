import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight, BookOpen, CircuitBoard, FlaskConical } from 'lucide-react';
import { BrandMark } from '@/components/brand-mark';
import { MagazineChannelNav } from '@/components/magazine-channel-nav';
import { blogSettings } from '@/lib/blog-settings';

export const metadata: Metadata = {
  title: 'About｜时工工程杂志',
  description: blogSettings.aboutIntro,
};

export default function BlogAboutPage() {
  return (
    <div className="magazine-page magazine-section-page">
      <MagazineChannelNav />
      <main className="magazine-about-page">
        <header className="magazine-editorial-header magazine-about-hero">
          <BrandMark variant="journal" />
          <p className="magazine-category">INDEPENDENT ENGINEERING JOURNAL</p>
          <h1>{blogSettings.aboutTitle}</h1>
          <p>{blogSettings.aboutIntro}</p>
        </header>

        <section className="magazine-about-intro">
          <div>
            <span><FlaskConical size={20} /></span>
            <h2>为什么写</h2>
            <p>{blogSettings.mission}</p>
          </div>
          <div>
            <span><CircuitBoard size={20} /></span>
            <h2>关注什么</h2>
            <p>{blogSettings.authorIntro}</p>
          </div>
          <div>
            <span><BookOpen size={20} /></span>
            <h2>怎么阅读</h2>
            <p>长文用于完整复盘，Notes 保留短判断，Archive 帮你从具体问题进入内容。</p>
          </div>
        </section>

        <section className="magazine-about-credentials">
          <p className="magazine-category">CREDENTIALS / 能力背书</p>
          <div>
            {blogSettings.credentials.map((item) => (
              <article key={item.title}><h3>{item.title}</h3><p>{item.description}</p></article>
            ))}
          </div>
        </section>

        <section className="magazine-about-contact">
          <div><p className="magazine-category">CONTACT / COLLABORATION</p><h2>把问题带到桌面上</h2><p>{blogSettings.contactText}</p></div>
          <div>
            <Link href={blogSettings.githubUrl} target="_blank" rel="noreferrer">GitHub <ArrowUpRight size={15} /></Link>
            <Link href="/showcase">Showcase <ArrowUpRight size={15} /></Link>
          </div>
        </section>
      </main>
    </div>
  );
}
