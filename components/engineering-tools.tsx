'use client';

import { Calculator, Check, Clipboard, Gauge, Radio, RotateCcw } from 'lucide-react';
import { useMemo, useState } from 'react';

type ToolTab = 'clock' | 'bandwidth' | 'number';

export function EngineeringTools() {
  const [tab, setTab] = useState<ToolTab>('clock');
  const [copied, setCopied] = useState(false);
  const [clockIn, setClockIn] = useState(100);
  const [clockOut, setClockOut] = useState(25);
  const [width, setWidth] = useState(24);
  const [height, setHeight] = useState(1080);
  const [fps, setFps] = useState(60);
  const [bits, setBits] = useState(24);
  const [number, setNumber] = useState('255');

  const clockResult = useMemo(() => {
    const ratio = Math.max(1, Math.round((clockIn * 1_000_000) / (clockOut * 1_000_000 * 2)));
    const actual = clockIn / (ratio * 2);
    const error = Math.abs(actual - clockOut) / clockOut * 100;
    return { ratio, actual, error };
  }, [clockIn, clockOut]);

  const bandwidth = useMemo(() => {
    const raw = width * height * fps * bits;
    return {
      gbps: raw / 1_000_000_000,
      mbps: raw / 8 / 1_000_000,
      recommended: raw / 8 / 1_000_000 / 0.72,
    };
  }, [width, height, fps, bits]);

  const parsedNumber = Number.parseInt(number || '0', 10) || 0;
  const verilog = `localparam integer DIVIDER = ${clockResult.ratio};\nreg [$clog2(DIVIDER)-1:0] cnt;\n\nalways @(posedge clk_in) begin\n  if (cnt == DIVIDER - 1) begin\n    cnt     <= 0;\n    clk_out <= ~clk_out;\n  end else cnt <= cnt + 1'b1;\nend`;

  const copyCode = async () => {
    await navigator.clipboard.writeText(verilog);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  return (
    <section className="section engineering-tools">
      <div className="tool-workbench">
        <div className="tool-tabs">
          <span>TOOL SELECT</span>
          <button className={tab === 'clock' ? 'active' : undefined} onClick={() => setTab('clock')}>
            <Radio size={16} /> 时钟分频
          </button>
          <button className={tab === 'bandwidth' ? 'active' : undefined} onClick={() => setTab('bandwidth')}>
            <Gauge size={16} /> 带宽估算
          </button>
          <button className={tab === 'number' ? 'active' : undefined} onClick={() => setTab('number')}>
            <Calculator size={16} /> 数制转换
          </button>
          <div className="local-note"><Check size={14} /> 本地计算 · 数据不上传</div>
        </div>

        <div className="tool-stage">
          {tab === 'clock' && (
            <>
              <div className="tool-stage-head">
                <div><p className="eyebrow">CLK DIVIDER / 01</p><h2>时钟分频计算器</h2></div>
                <button onClick={() => { setClockIn(100); setClockOut(25); }}>
                  <RotateCcw size={15} /> 重置
                </button>
              </div>
              <div className="tool-input-grid">
                <label>输入时钟 <span>MHz</span><input min="0.001" step="0.001" type="number" value={clockIn} onChange={(e) => setClockIn(Number(e.target.value))} /></label>
                <label>目标时钟 <span>MHz</span><input min="0.001" step="0.001" type="number" value={clockOut} onChange={(e) => setClockOut(Number(e.target.value))} /></label>
              </div>
              <div className="tool-results">
                <div><span>分频计数值</span><strong>{clockResult.ratio}</strong></div>
                <div><span>实际输出</span><strong>{clockResult.actual.toFixed(4)} <small>MHz</small></strong></div>
                <div><span>相对误差</span><strong>{clockResult.error.toFixed(4)} <small>%</small></strong></div>
              </div>
              <div className="code-output">
                <div><span>Verilog 参考模板</span><button onClick={copyCode}>{copied ? <Check size={15} /> : <Clipboard size={15} />}{copied ? '已复制' : '复制代码'}</button></div>
                <pre><code>{verilog}</code></pre>
              </div>
              <p className="tool-tip"><strong>工程提示：</strong>整数分频仅能得到输入频率的偶数分频。非整数频率建议使用 MMCM/PLL 或相位累加器。</p>
            </>
          )}

          {tab === 'bandwidth' && (
            <>
              <div className="tool-stage-head">
                <div><p className="eyebrow">VIDEO BANDWIDTH / 02</p><h2>视频接口带宽估算</h2></div>
              </div>
              <div className="tool-input-grid four">
                <label>水平像素 <span>px</span><input type="number" value={width} onChange={(e) => setWidth(Number(e.target.value))} /></label>
                <label>垂直像素 <span>px</span><input type="number" value={height} onChange={(e) => setHeight(Number(e.target.value))} /></label>
                <label>帧率 <span>fps</span><input type="number" value={fps} onChange={(e) => setFps(Number(e.target.value))} /></label>
                <label>像素位宽 <span>bit</span><input type="number" value={bits} onChange={(e) => setBits(Number(e.target.value))} /></label>
              </div>
              <div className="tool-results">
                <div><span>原始数据率</span><strong>{bandwidth.gbps.toFixed(3)} <small>Gbps</small></strong></div>
                <div><span>有效吞吐</span><strong>{bandwidth.mbps.toFixed(1)} <small>MB/s</small></strong></div>
                <div><span>建议总线带宽</span><strong>{bandwidth.recommended.toFixed(1)} <small>MB/s</small></strong></div>
              </div>
              <div className="bandwidth-meter">
                <div><span>按 72% 总线效率预留</span><strong>{Math.round(bandwidth.mbps / bandwidth.recommended * 100)}%</strong></div>
                <i><b style={{ width: `${Math.min(100, bandwidth.mbps / bandwidth.recommended * 100)}%` }} /></i>
              </div>
              <p className="tool-tip"><strong>工程提示：</strong>结果未包含消隐期、协议开销和多次读写。做 DDR 方案时还应叠加缓存搬运次数。</p>
            </>
          )}

          {tab === 'number' && (
            <>
              <div className="tool-stage-head">
                <div><p className="eyebrow">RADIX CONVERTER / 03</p><h2>整数数制转换</h2></div>
              </div>
              <div className="number-input">
                <label>十进制输入<input value={number} inputMode="numeric" onChange={(e) => setNumber(e.target.value.replace(/[^\d-]/g, ''))} /></label>
              </div>
              <div className="number-results">
                <div><span>HEX</span><code>0x{(parsedNumber >>> 0).toString(16).toUpperCase()}</code></div>
                <div><span>BINARY</span><code>{(parsedNumber >>> 0).toString(2)}</code></div>
                <div><span>OCTAL</span><code>0o{(parsedNumber >>> 0).toString(8)}</code></div>
                <div><span>VERILOG</span><code>32&apos;d{parsedNumber}</code></div>
              </div>
              <p className="tool-tip"><strong>工程提示：</strong>当前按 32 位无符号展示二进制/十六进制；负数会以二进制补码形式转换。</p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
