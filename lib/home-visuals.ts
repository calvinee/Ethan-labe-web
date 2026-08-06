import settings from '@/content/settings/home.json';

export type HomeBackgroundStyle = 'clean' | 'nebula' | 'deep-space' | 'blueprint' | 'aurora';
export type HomeOverlayStrength = 'soft' | 'balanced' | 'strong';

export type HomeVisualSettings = {
  heroImage: string;
  heroAlt: string;
  backgroundImage: string;
  backgroundStyle: HomeBackgroundStyle;
  backgroundPosition: 'left top' | 'center top' | 'right top' | 'center center';
  overlayStrength: HomeOverlayStrength;
  showBackgroundSwitcher: boolean;
};

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
};
