import settings from '@/content/settings/home.json';

export type HomeBackgroundStyle = 'clean' | 'nebula' | 'deep-space' | 'blueprint' | 'aurora';
export type HomeOverlayStrength = 'soft' | 'balanced' | 'strong';

export type HomeCredential = {
  label: string;
  title: string;
  description: string;
};

export type HomeVisualSettings = {
  heroImage: string;
  heroAlt: string;
  backgroundImage: string;
  backgroundStyle: HomeBackgroundStyle;
  backgroundPosition: 'left top' | 'center top' | 'right top' | 'center center';
  overlayStrength: HomeOverlayStrength;
  showBackgroundSwitcher: boolean;
  credentials: HomeCredential[];
};

const defaultCredentials: HomeCredential[] = [
  { label: '量产工程', title: '量产 FPGA 系统研发', description: '系统设计 · 验证 · 稳定性' },
  { label: '行业经历', title: 'Bosch · AMD', description: 'NovaStar · HeyGears' },
  { label: '技术竞赛', title: 'AMD-Xilinx', description: '自适应计算挑战赛入围' },
  { label: '荣誉奖项', title: '研究生国家奖学金', description: '全国研究生电子设计竞赛国家一等奖 · 三等奖' },
  { label: '研究成果', title: '2 项发明专利申请', description: 'FPGA AI 加速论文 · SCI / EI 成果' },
];

const backgroundStyles = new Set<HomeBackgroundStyle>([
  'clean',
  'nebula',
  'deep-space',
  'blueprint',
  'aurora',
]);
const backgroundPositions = new Set<HomeVisualSettings['backgroundPosition']>([
  'left top',
  'center top',
  'right top',
  'center center',
]);
const overlayStrengths = new Set<HomeOverlayStrength>(['soft', 'balanced', 'strong']);

const safeAssetPath = (value: string, fallback: string) =>
  value.startsWith('/') && !/["'\\)]/.test(value) ? value : fallback;

const credentials = Array.isArray(settings.credentials)
  ? settings.credentials
      .map((item) => ({
        label: String(item.label ?? '').trim(),
        title: String(item.title ?? '').trim(),
        description: String(item.description ?? '').trim(),
      }))
      .filter((item) => item.label && item.title && item.description)
      .slice(0, 5)
  : [];

export const homeVisualSettings: HomeVisualSettings = {
  heroImage: safeAssetPath(settings.heroImage, '/lab-hero.png'),
  heroAlt: settings.heroAlt || 'FPGA 实验室项目封面',
  backgroundImage: safeAssetPath(
    settings.backgroundImage,
    '/uploads/backgrounds/pillars-of-creation.webp',
  ),
  backgroundStyle: backgroundStyles.has(settings.backgroundStyle as HomeBackgroundStyle)
    ? (settings.backgroundStyle as HomeBackgroundStyle)
    : 'clean',
  backgroundPosition: backgroundPositions.has(
    settings.backgroundPosition as HomeVisualSettings['backgroundPosition'],
  )
    ? (settings.backgroundPosition as HomeVisualSettings['backgroundPosition'])
    : 'right top',
  overlayStrength: overlayStrengths.has(settings.overlayStrength as HomeOverlayStrength)
    ? (settings.overlayStrength as HomeOverlayStrength)
    : 'balanced',
  showBackgroundSwitcher: settings.showBackgroundSwitcher !== false,
  credentials: credentials.length > 0 ? credentials : defaultCredentials,
};
