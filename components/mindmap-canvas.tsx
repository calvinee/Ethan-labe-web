import type { MindMapEntry } from '@/lib/mdx-content';

export function MindMapCanvas({
  entry,
  detailed = false,
}: {
  entry: MindMapEntry;
  detailed?: boolean;
}) {
  const branches = entry.branches.slice(0, 4);

  return (
    <div
      className={`mindmap-canvas mindmap-canvas-${entry.accent} ${detailed ? 'mindmap-canvas-detailed' : ''}`}
      aria-label={`${entry.title}：中心主题为${entry.center}，包含${branches.map((branch) => branch.title).join('、')}`}
    >
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <path d="M50 50 C39 50 35 23 20 22" />
        <path d="M50 50 C61 50 65 23 80 22" />
        <path d="M50 50 C39 50 35 77 20 78" />
        <path d="M50 50 C61 50 65 77 80 78" />
      </svg>
      <div className="mindmap-core"><span>CORE</span><strong>{entry.center}</strong></div>
      {branches.map((branch, index) => (
        <div className={`mindmap-branch mindmap-branch-${index + 1}`} key={branch.title}>
          <span>{String(index + 1).padStart(2, '0')}</span>
          <strong>{branch.title}</strong>
          {detailed && <small>{branch.summary}</small>}
        </div>
      ))}
    </div>
  );
}
