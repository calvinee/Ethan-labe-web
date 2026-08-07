import {
  ArrowUpRight,
  BookOpen,
  GitFork,
  MapPin,
  RefreshCw,
  Star,
  UserPlus,
  Users,
} from 'lucide-react';
import type { CSSProperties } from 'react';
import { githubProfile } from '@/lib/github-profile';

const weekdayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

function GitHubMark({ size = 18 }: { size?: number }) {
  return (
    <svg aria-hidden="true" height={size} viewBox="0 0 16 16" width={size}>
      <path
        d="M8 0C3.58 0 0 3.64 0 8.13c0 3.59 2.29 6.64 5.47 7.71.4.08.55-.18.55-.39 0-.19-.01-.83-.01-1.51-2.01.38-2.53-.5-2.69-.96-.09-.23-.48-.96-.82-1.15-.28-.15-.68-.53-.01-.54.63-.01 1.08.59 1.23.83.72 1.23 1.87.88 2.33.67.07-.53.28-.88.51-1.08-1.78-.21-3.64-.91-3.64-4.02 0-.89.31-1.62.82-2.19-.08-.21-.36-1.04.08-2.16 0 0 .67-.22 2.2.84A7.43 7.43 0 0 1 8 3.99c.68 0 1.36.09 2 .27 1.53-1.06 2.2-.84 2.2-.84.44 1.12.16 1.95.08 2.16.51.57.82 1.3.82 2.19 0 3.12-1.87 3.81-3.65 4.02.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.47.55.39A8.03 8.03 0 0 0 16 8.13C16 3.64 12.42 0 8 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

const formatUpdatedAt = (value: string) =>
  new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value));

const formatSnapshotTime = (value: string) =>
  new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Shanghai',
  }).format(new Date(value));

export function GitHubShowcase({ compact = false }: { compact?: boolean }) {
  const { profile, contributions } = githubProfile;
  const repositories = githubProfile.repositories.slice(0, 6);

  return (
    <section className={`github-column ${compact ? 'github-column-compact' : ''}`}>
      <div className="github-column-heading">
        <div>
          <p className="research-label">GITHUB / OPEN SOURCE</p>
          <h2>{compact ? 'GitHub 公开贡献' : '代码、复现与持续迭代'}</h2>
          {!compact && <p>项目不是一张最终效果图，而是一条可以检查提交、版本和工程证据的公开轨迹。</p>}
        </div>
        <a href={profile.url} rel="noreferrer" target="_blank">
          访问 GitHub <ArrowUpRight size={16} />
        </a>
      </div>

      <div className="github-overview-grid">
        <article className="github-profile-panel">
          <div className="github-profile-identity">
            <img src={profile.avatarUrl} width="72" height="72" alt={`${profile.name} 的 GitHub 头像`} />
            <div>
              <span>@{profile.login}</span>
              <h3>{profile.name}</h3>
              {profile.location && <p><MapPin size={14} /> {profile.location}</p>}
            </div>
          </div>
          <p className="github-bio">
            {profile.bio || 'FPGA、AI 硬件与软硬件协同项目的公开工程档案。'}
          </p>
          <div className="github-profile-stats">
            <span><BookOpen size={15} /><strong>{profile.publicRepositories}</strong> 公开仓库</span>
            <span><Users size={15} /><strong>{profile.followers}</strong> 关注者</span>
            <span><GitHubMark size={15} /><strong>{contributions.totalContributions}</strong> 年度贡献</span>
          </div>
          <a className="github-follow-button" href={profile.url} rel="noreferrer" target="_blank">
            <UserPlus size={17} /> 在 GitHub 关注时工
          </a>
        </article>

        <article className="github-contribution-panel">
          <div className="github-contribution-head">
            <div>
              <strong>{contributions.totalContributions} contributions</strong>
              <span>in the last year</span>
            </div>
            <a href={`${profile.url}?tab=overview`} rel="noreferrer" target="_blank">
              查看贡献记录 <ArrowUpRight size={14} />
            </a>
          </div>
          <div className="github-calendar-scroll">
            <div className="github-calendar-layout">
              <div className="github-month-spacer" />
              <div className="github-months">
                {contributions.months.map((month) => (
                  <span
                    key={`${month.year}-${month.name}`}
                    style={{ gridColumn: `span ${Math.max(1, month.totalWeeks)}` }}
                  >
                    {new Intl.DateTimeFormat('zh-CN', { month: 'short' }).format(new Date(`${month.firstDay}T00:00:00Z`))}
                  </span>
                ))}
              </div>
              <div className="github-weekdays" aria-hidden="true">
                {weekdayLabels.map((label, index) => <span key={`${label}-${index}`}>{label}</span>)}
              </div>
              <div
                className="github-calendar"
                role="img"
                aria-label={`过去一年共有 ${contributions.totalContributions} 次 GitHub 贡献`}
              >
                {contributions.weeks.map((week) => (
                  <div className="github-calendar-week" key={week.firstDay}>
                    {Array.from({ length: 7 }, (_, weekday) => {
                      const day = week.days.find((item) => item.weekday === weekday);
                      if (!day) return <i className="github-calendar-empty" key={weekday} />;
                      return (
                        <i
                          className="github-calendar-day"
                          data-level={day.level}
                          key={day.date}
                          title={`${day.date}: ${day.count} contributions`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="github-calendar-foot">
            <span><RefreshCw size={13} /> 每 6 小时自动同步</span>
            <span className="github-calendar-legend">少 <i data-level="0" /><i data-level="1" /><i data-level="2" /><i data-level="3" /><i data-level="4" /> 多</span>
          </div>
        </article>
      </div>

      {!compact && (
        <>
          <div className="github-repositories-head">
            <div>
              <GitHubMark size={20} />
              <h3>Popular repositories</h3>
            </div>
            <span>按 Star 自动排序 · 更新于 {formatSnapshotTime(githubProfile.generatedAt)}</span>
          </div>
          <div className="github-repository-grid">
            {repositories.map((repository) => (
              <a href={repository.url} key={repository.nameWithOwner} rel="noreferrer" target="_blank">
                <div className="github-repository-title">
                  <BookOpen size={16} />
                  <strong>{repository.name}</strong>
                  <ArrowUpRight size={15} />
                </div>
                <p>{repository.description || '打开仓库查看工程说明、源代码与最新提交。'}</p>
                {repository.topics.length > 0 && (
                  <div className="github-repository-topics">
                    {repository.topics.slice(0, 3).map((topic) => <span key={topic}>{topic}</span>)}
                  </div>
                )}
                <div className="github-repository-meta">
                  {repository.primaryLanguage && (
                    <span
                      className="github-language"
                      style={{ '--github-language': repository.primaryLanguage.color } as CSSProperties}
                    >
                      <i /> {repository.primaryLanguage.name}
                    </span>
                  )}
                  <span><Star size={13} /> {repository.stargazerCount}</span>
                  <span><GitFork size={13} /> {repository.forkCount}</span>
                  <span className="github-updated">更新 {formatUpdatedAt(repository.updatedAt)}</span>
                </div>
              </a>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
