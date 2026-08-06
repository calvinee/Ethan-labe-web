import snapshot from '@/data/github-profile.json';

export type GitHubRepository = {
  name: string;
  nameWithOwner: string;
  description: string;
  url: string;
  homepageUrl: string;
  stargazerCount: number;
  forkCount: number;
  updatedAt: string;
  primaryLanguage: { name: string; color: string } | null;
  topics: string[];
};

export type GitHubContributionDay = {
  date: string;
  weekday: number;
  count: number;
  level: number;
};

export type GitHubProfileSnapshot = {
  generatedAt: string;
  profile: {
    login: string;
    name: string;
    bio: string;
    avatarUrl: string;
    url: string;
    location: string;
    websiteUrl: string;
    followers: number;
    following: number;
    publicRepositories: number;
  };
  repositorySource: string;
  repositories: GitHubRepository[];
  contributions: {
    totalContributions: number;
    months: Array<{
      name: string;
      year: number;
      firstDay: string;
      totalWeeks: number;
    }>;
    weeks: Array<{
      firstDay: string;
      days: GitHubContributionDay[];
    }>;
  };
};

export const githubProfile: GitHubProfileSnapshot = snapshot;
