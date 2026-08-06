'use client';

import { Check, Palette, RotateCcw } from 'lucide-react';
import type { CSSProperties, ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import type { HomeBackgroundStyle, HomeVisualSettings } from '@/lib/home-visuals';

const sceneOptions: Array<{
  value: HomeBackgroundStyle;
  label: string;
  note: string;
}> = [
  { value: 'clean', label: '清爽', note: '纯净阅读' },
  { value: 'nebula', label: '星云', note: '作品发布' },
  { value: 'deep-space', label: '深空', note: '沉浸展示' },
  { value: 'blueprint', label: '电路', note: '技术文档' },
  { value: 'aurora', label: '极光', note: 'AI 场景' },
];

const strengthOpacity = {
  soft: 0.22,
  balanced: 0.32,
  strong: 0.42,
} as const;

export function HomeVisualFrame({
  children,
  settings,
}: {
  children: ReactNode;
  settings: HomeVisualSettings;
}) {
  const [scene, setScene] = useState<HomeBackgroundStyle>(settings.backgroundStyle);
  const [visitorOverride, setVisitorOverride] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('shi-lab-home-scene') as HomeBackgroundStyle | null;
    if (saved && sceneOptions.some((option) => option.value === saved)) {
      setScene(saved);
      setVisitorOverride(true);
    }
  }, []);

  const activeLabel = useMemo(
    () => sceneOptions.find((option) => option.value === scene)?.label ?? '背景',
    [scene],
  );
  const backdropOpacity = strengthOpacity[settings.overlayStrength];
  const style = {
    '--home-backdrop-image': `url("${settings.backgroundImage}")`,
    '--home-backdrop-position': settings.backgroundPosition,
    '--home-backdrop-opacity': backdropOpacity,
    '--home-backdrop-opacity-medium': backdropOpacity * 0.78,
    '--home-backdrop-opacity-soft': backdropOpacity * 0.52,
    '--home-backdrop-opacity-faint': backdropOpacity * 0.16,
  } as CSSProperties;

  const chooseScene = (value: HomeBackgroundStyle) => {
    setScene(value);
    setVisitorOverride(true);
    localStorage.setItem('shi-lab-home-scene', value);
  };

  const resetScene = () => {
    localStorage.removeItem('shi-lab-home-scene');
    setScene(settings.backgroundStyle);
    setVisitorOverride(false);
  };

  return (
    <div className={`home-visual-frame home-scene-${scene}`} style={style}>
      <div className="home-backdrop-ambient" aria-hidden="true" />
      <div className="home-backdrop-media" aria-hidden="true" />
      <div className="home-backdrop-scrim" aria-hidden="true" />

      {settings.showBackgroundSwitcher && (
        <details className="home-scene-control">
          <summary aria-label={`切换首页背景，当前为${activeLabel}`}>
            <Palette size={15} />
            <span>场景背景</span>
            <strong>{activeLabel}</strong>
          </summary>
          <div className="home-scene-menu">
            <div>
              <span>选择适合当前阅读场景的背景</span>
              {visitorOverride && (
                <button type="button" onClick={resetScene}>
                  <RotateCcw size={13} /> 跟随站点
                </button>
              )}
            </div>
            {sceneOptions.map((option) => (
              <button
                type="button"
                className={scene === option.value ? 'active' : undefined}
                aria-pressed={scene === option.value}
                onClick={() => chooseScene(option.value)}
                key={option.value}
              >
                <i className={`scene-swatch scene-swatch-${option.value}`} />
                <span><strong>{option.label}</strong><small>{option.note}</small></span>
                {scene === option.value && <Check size={14} />}
              </button>
            ))}
          </div>
        </details>
      )}

      <div className="home-visual-content">{children}</div>
    </div>
  );
}
