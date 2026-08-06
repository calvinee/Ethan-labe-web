import { access, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const login = process.env.GITHUB_USERNAME?.trim() || 'calvinee';
const token = process.env.GITHUB_TOKEN?.trim();
const updateRequired = process.env.GITHUB_UPDATE_REQUIRED === 'true';
const outputUrl = new URL('../data/github-profile.json', import.meta.url);
const outputPath = fileURLToPath(outputUrl);

const query = String.raw`
  fragment RepositoryCard on Repository {
    name
    nameWithOwner
    description
    url
    homepageUrl
    stargazerCount
    forkCount
    updatedAt
    primaryLanguage {
      name
      color
    }
    repositoryTopics(first: 4) {
      nodes {
        topic {
          name
        }
      }
    }
  }

  query GitHubShowcase($login: String!) {
    user(login: $login) {
      login
      name
      bio
      avatarUrl
      url
      location
      websiteUrl
      followers {
        totalCount
      }
      following {
        totalCount
      }
      repositoryCount: repositories(privacy: PUBLIC) {
        totalCount
      }
      popularRepositories: repositories(
        first: 6
        ownerAffiliations: OWNER
        privacy: PUBLIC
        isFork: false
        orderBy: { field: STARGAZERS, direction: DESC }
      ) {
        nodes {
          ...RepositoryCard
        }
      }
      contributionsCollection {
        contributionCalendar {
          totalContributions
          months {
            name
            year
            firstDay
            totalWeeks
          }
          weeks {
            firstDay
            contributionDays {
              date
              weekday
              contributionCount
              contributionLevel
            }
          }
        }
      }
    }
  }
`;

const levelMap = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

async function keepExistingSnapshot(reason) {
  try {
    await access(outputUrl);
    console.warn(`[github:update] ${reason}; keeping ${outputPath}`);
  } catch {
    throw new Error(`[github:update] ${reason}; no fallback snapshot exists`);
  }
}

if (!token) {
  if (updateRequired) {
    throw new Error('[github:update] GITHUB_TOKEN is required for this production build');
  }
  await keepExistingSnapshot('GITHUB_TOKEN is not available');
  process.exit(0);
}

try {
  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'shi-fpga-lab-build',
    },
    body: JSON.stringify({ query, variables: { login } }),
  });

  if (!response.ok) {
    throw new Error(`GitHub GraphQL returned ${response.status}`);
  }

  const payload = await response.json();
  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message).join('; '));
  }

  const user = payload.data?.user;
  if (!user) throw new Error(`GitHub user ${login} was not found`);

  const repositorySource = user.popularRepositories.nodes.filter(Boolean);
  const calendar = user.contributionsCollection.contributionCalendar;
  const snapshot = {
    generatedAt: new Date().toISOString(),
    profile: {
      login: user.login,
      name: user.name || user.login,
      bio: user.bio || '',
      avatarUrl: user.avatarUrl,
      url: user.url,
      location: user.location || '',
      websiteUrl: user.websiteUrl || '',
      followers: user.followers.totalCount,
      following: user.following.totalCount,
      publicRepositories: user.repositoryCount.totalCount,
    },
    repositorySource: 'stars',
    repositories: repositorySource.map((repository) => ({
      name: repository.name,
      nameWithOwner: repository.nameWithOwner,
      description: repository.description || '',
      url: repository.url,
      homepageUrl: repository.homepageUrl || '',
      stargazerCount: repository.stargazerCount,
      forkCount: repository.forkCount,
      updatedAt: repository.updatedAt,
      primaryLanguage: repository.primaryLanguage
        ? {
            name: repository.primaryLanguage.name,
            color: repository.primaryLanguage.color || '#8b949e',
          }
        : null,
      topics: repository.repositoryTopics.nodes
        .map((node) => node?.topic?.name)
        .filter(Boolean),
    })),
    contributions: {
      totalContributions: calendar.totalContributions,
      months: calendar.months.map((month) => ({
        name: month.name,
        year: month.year,
        firstDay: month.firstDay,
        totalWeeks: month.totalWeeks,
      })),
      weeks: calendar.weeks.map((week) => ({
        firstDay: week.firstDay,
        days: week.contributionDays.map((day) => ({
          date: day.date,
          weekday: day.weekday,
          count: day.contributionCount,
          level: levelMap[day.contributionLevel] ?? 0,
        })),
      })),
    },
  };

  await mkdir(new URL('../data/', import.meta.url), { recursive: true });
  await writeFile(outputUrl, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  console.log(
    `[github:update] wrote ${snapshot.repositories.length} repositories and ` +
      `${snapshot.contributions.totalContributions} contributions for @${login}`,
  );
} catch (error) {
  if (updateRequired) throw error;
  await keepExistingSnapshot(error instanceof Error ? error.message : 'GitHub update failed');
}
