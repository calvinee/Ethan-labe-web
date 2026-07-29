'use client';

import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Check,
  ChevronDown,
  Clock3,
  Copy,
  Heart,
  Lightbulb,
  MessageCircle,
  Repeat2,
  Share2,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const toc = [
  ['why', '为什么“能跑”还不够'],
  ['baseline', '01 · 建立需求与接口基线'],
  ['architecture', '02 · 先算清数据，再画架构'],
  ['timing', '03 · 约束是设计的一部分'],
  ['verify', '04 · 让验证覆盖真实风险'],
  ['delivery', '05 · 交付一个可继续维护的项目'],
] as const;

const code = `create_clock -period 10.000 -name sys_clk [get_ports sys_clk]

# 外部 ADC 的数据相对转发时钟到达
set_input_delay -clock adc_dco -max 2.100 [get_ports {adc_data[*]}]
set_input_delay -clock adc_dco -min 0.350 [get_ports {adc_data[*]}]

# 异步控制信号必须经过同步器
set_false_path -to [get_pins u_sync/ff_meta/D]`;

export function GuideArticle() {
  const [copied, setCopied] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? Math.min(100, window.scrollY / total * 100) : 0);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const shareArticle = async () => {
    if (navigator.share) {
      await navigator.share({
        title: '从 RTL 到可交付：FPGA 工程项目指南',
        url: window.location.href,
      });
      return;
    }
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="magazine-article">
      <div className="reading-progress" style={{ width: `${progress}%` }} />

      <article>
        <header className="magazine-article-header">
          <p className="magazine-category">工程方法 · FPGA PROJECT DELIVERY</p>
          <h1>从 RTL 到可交付：<br />FPGA 工程项目指南</h1>
          <p className="magazine-article-deck">
            能生成 bitstream 只是开始。真正的工程交付，要让接口、时序、验证、版本与文档都经得起复现。
          </p>

          <div className="magazine-author-row">
            <span className="magazine-avatar">时</span>
            <span>
              <strong>时工</strong>
              <small>2026 年 7 月 18 日 · <Clock3 size={12} /> 15 分钟阅读</small>
            </span>
          </div>

          <div className="magazine-article-actions">
            <button><Heart size={18} /> 198</button>
            <button><MessageCircle size={18} /> 27</button>
            <button><Repeat2 size={18} /> 48</button>
            <button onClick={shareArticle}><Share2 size={18} /> 分享</button>
            <button aria-label="收藏文章"><Bookmark size={18} /></button>
          </div>
        </header>

        <details className="magazine-toc">
          <summary><span>文章目录</span><ChevronDown size={18} /></summary>
          <nav>
            {toc.map(([id, label]) => <a href={`#${id}`} key={id}>{label}</a>)}
          </nav>
        </details>

        <figure className="magazine-article-hero">
          <div className="article-hero-grid" />
          <div className="article-hero-title">
            <span>FPGA PROJECT DELIVERY</span>
            <strong>DESIGN → VERIFY → SHIP</strong>
          </div>
          <div className="flow-node flow-requirement"><span>01</span>需求基线</div>
          <div className="flow-node flow-rtl"><span>02</span>RTL 设计</div>
          <div className="flow-node flow-verify"><span>03</span>验证证据</div>
          <div className="flow-node flow-release"><span>04</span>可复现交付</div>
          <i className="flow-line line-one" />
          <i className="flow-line line-two" />
          <i className="flow-line line-three" />
          <figcaption>图 1：一项 FPGA 工作从需求输入到工程资产的完整闭环。</figcaption>
        </figure>

        <div className="article-prose">
          <p className="article-update"><strong>最后更新：</strong>2026 年 7 月 26 日（补充时序约束检查清单）</p>

          <section id="why">
            <p>
              很多 FPGA 项目在演示当天是成功的：LED 会闪，波形正确，数据也能跑通。但几周之后换一个器件、
              工具版本或采样频率，工程就开始变得不可预测。原因通常不是 RTL 语法，而是关键判断只存在于作者脑中。
            </p>
            <p>
              我更愿意把“可交付”定义为：另一个工程师能在明确环境里重新生成结果，知道边界在哪里，
              并能根据保存下来的证据判断一次修改是否安全。
            </p>

            <aside className="magazine-callout">
              <Lightbulb size={21} />
              <div>
                <strong>核心判断</strong>
                <p>工程质量不是功能数量，而是你管理接口、时序和未知风险的能力。</p>
              </div>
            </aside>
          </section>

          <hr />

          <section id="baseline">
            <h2>01. 建立需求与接口基线</h2>
            <p>
              不要从“先写个模块看看”开始。先把输入输出、吞吐、延时、异常处理和验证条件放在同一张表里。
              需求基线不必很长，但必须能把模糊的“尽量快”转换成可测量的约束。
            </p>

            <div className="magazine-table">
              <div className="table-head"><span>对象</span><span>必须明确</span><span>验收证据</span></div>
              <div><span>数据接口</span><span>位宽、频率、背压、包格式</span><span>协议仿真与错误注入</span></div>
              <div><span>时钟复位</span><span>来源、容差、复位时序、CDC</span><span>约束报告与结构检查</span></div>
              <div><span>性能</span><span>持续带宽、峰值、端到端延时</span><span>板上计数器与测量记录</span></div>
              <div><span>异常</span><span>超时、丢包、溢出后的策略</span><span>恢复路径测试</span></div>
            </div>

            <p>
              这一步最有价值的产物不是表格，而是团队对“做完”的统一理解。每一个无法被测试的形容词，
              都需要改写成数字、状态或明确的观察方式。
            </p>
          </section>

          <section id="architecture">
            <h2>02. 先算清数据，再画架构</h2>
            <p>
              FPGA 的架构图应该是计算结果，而不是审美结果。先算每一级的数据率、突发长度、缓存深度和最坏等待时间，
              再决定并行度、时钟域与存储层次。
            </p>

            <div className="magazine-formula">
              <span>BANDWIDTH BASELINE</span>
              <code>BW = channels × sample_rate × bits_per_sample</code>
              <p>8 通道 × 125 MSPS × 16 bit = 16 Gbit/s 原始输入带宽</p>
            </div>

            <figure className="article-inline-diagram">
              <div>
                <span>ADC × 8</span><i />
                <span>CDC / ALIGN</span><i />
                <span>DDR RING</span><i />
                <span>PACKET TX</span>
              </div>
              <figcaption>图 2：用数据通路和时钟域共同定义系统边界。</figcaption>
            </figure>

            <p>
              每个缓存都应该能回答两个问题：它在吸收什么不确定性？最坏情况下能撑多久？
              如果答案只是“保险一点”，就还没有完成设计。
            </p>
          </section>

          <section id="timing">
            <h2>03. 约束是设计的一部分</h2>
            <p>
              约束不是项目结束前补上的文件。它描述设计对物理世界的假设：时钟何时到达、数据在何时稳定、
              哪些路径真的异步，以及工具可以对哪些例外停止分析。
            </p>

            <div className="article-code magazine-code">
              <div>
                <span>XDC · timing-baseline.xdc</span>
                <button onClick={copyCode}><Copy size={14} /> {copied ? '已复制' : '复制'}</button>
              </div>
              <pre><code>{code}</code></pre>
            </div>

            <aside className="magazine-callout warning">
              <AlertTriangle size={21} />
              <div>
                <strong>危险信号</strong>
                <p>大量使用 false_path 让报告变绿，往往是在删除问题，而不是解决问题。</p>
              </div>
            </aside>
          </section>

          <section id="verify">
            <h2>04. 让验证覆盖真实风险</h2>
            <p>
              验证计划应该来自架构风险，而不是模块目录。对于跨时钟、突发流量和复位恢复，
              “跑过一次正常数据”几乎没有证明力。
            </p>
            <ol className="magazine-steps">
              {[
                ['正常路径', '覆盖额定吞吐、最小包、最大包与连续运行。'],
                ['边界条件', '覆盖 FIFO 临界水位、计数器回卷与参数极值。'],
                ['故障注入', '主动制造丢时钟、背压、错误码与中途复位。'],
                ['板级证据', '保存 ILA、示波器、误码率与温度条件。'],
              ].map(([title, description], index) => (
                <li key={title}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <div><strong>{title}</strong><p>{description}</p></div>
                </li>
              ))}
            </ol>
          </section>

          <section id="delivery">
            <h2>05. 交付一个可继续维护的项目</h2>
            <p>
              最后的工作不是压缩工程文件，而是把隐含状态搬进仓库。版本、构建方法、器件信息、
              约束来源、已知问题和验收记录都应该被明确保存。
            </p>
            <div className="magazine-checklist">
              {[
                '一条命令或一份明确步骤可重新生成 bitstream',
                '源文件、IP 配置和约束全部纳入版本管理',
                'README 说明工具版本、目录、接口与构建方法',
                '保留关键仿真、时序、资源和板级测试结果',
                'CHANGELOG 记录接口变化、缺陷修复和兼容性',
              ].map((item) => <div key={item}><Check size={17} />{item}</div>)}
            </div>
          </section>

          <aside className="magazine-takeaway">
            <span>TAKEAWAY</span>
            <h2>工程能力，体现在你如何管理不确定性</h2>
            <p>清楚定义边界，用验证证据推进判断，并让结果能被团队复现——这也是一份高质量作品最有说服力的部分。</p>
          </aside>
        </div>

        <section className="magazine-support">
          <p>这本工程杂志是时工的独立项目。</p>
          <p>如果本文对你有帮助，欢迎收藏、分享，或看看实验室正在交付的 FPGA IP 与硬件项目。</p>
          <Link href="/products">查看实验室产品 <ArrowRight size={16} /></Link>
        </section>

        <section className="magazine-article-subscribe">
          <span className="magazine-stamp">S</span>
          <div>
            <h3>订阅时工工程杂志</h3>
            <p>和 FPGA、AI 硬件工程师一起，把项目经验变成可复用的公共知识。</p>
          </div>
          <form onSubmit={(event) => event.preventDefault()}>
            <input type="email" aria-label="邮箱" placeholder="Type your email..." />
            <button type="submit">订阅</button>
          </form>
        </section>

        <div className="magazine-bottom-actions">
          <button><Heart size={18} /> 198</button>
          <button><MessageCircle size={18} /> 27</button>
          <button onClick={shareArticle}><Share2 size={18} /> 分享</button>
        </div>
      </article>

      <section className="magazine-related">
        <div>
          <strong>更多工程长文</strong>
          <Link href="/blog">查看全部</Link>
        </div>
        <div className="magazine-related-grid">
          <Link href="/guide">
            <small>FPGA × AI</small>
            <h3>从 RTL 到端侧部署：一块 AI 加速板的完整诞生</h3>
            <span>18 分钟阅读</span>
          </Link>
          <Link href="/guide">
            <small>调试手记</small>
            <h3>一次跨时钟域偶发错误的定位过程</h3>
            <span>9 分钟阅读</span>
          </Link>
          <Link href="/guide">
            <small>市场观察</small>
            <h3>国产 FPGA 的机会，不只在“替代”</h3>
            <span>12 分钟阅读</span>
          </Link>
        </div>
      </section>

      <nav className="magazine-article-pager">
        <Link href="/blog"><ArrowLeft size={17} /> 返回工程杂志</Link>
        <Link href="/showcase">浏览代表项目 <ArrowRight size={17} /></Link>
      </nav>
    </div>
  );
}
