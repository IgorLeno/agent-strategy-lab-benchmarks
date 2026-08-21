export interface NavItem {
  label: string;
  active?: boolean;
}

export const workspaceNav: NavItem[] = [
  { label: 'Overview', active: true },
  { label: 'Projects' },
  { label: 'Deployments' },
  { label: 'Insights' },
  { label: 'Team' },
];

export const accountNav: NavItem[] = [{ label: 'Billing' }, { label: 'Settings' }];

export interface StatCardData {
  label: string;
  value: string;
  delta: string;
  direction: 'up' | 'down';
}

export const statCards: StatCardData[] = [
  { label: 'Active deploys', value: '128', delta: '12.4% vs last week', direction: 'up' },
  { label: 'Build success', value: '96.2%', delta: '1.8% vs last week', direction: 'up' },
  { label: 'Avg build time', value: '3m 41s', delta: '8.1% slower', direction: 'down' },
  { label: 'Open incidents', value: '2', delta: '1 resolved today', direction: 'up' },
];

export interface ChartPoint {
  label: string;
  value: number;
}

export const deploymentVolume: ChartPoint[] = [
  { label: 'Mon', value: 62 },
  { label: 'Tue', value: 88 },
  { label: 'Wed', value: 47 },
  { label: 'Thu', value: 100 },
  { label: 'Fri', value: 82 },
  { label: 'Sat', value: 30 },
  { label: 'Sun', value: 55 },
];

export type ProjectStatus = 'Live' | 'In review' | 'Paused';

export interface Project {
  initials: string;
  name: string;
  owner: string;
  status: ProjectStatus;
  updated: string;
}

export const projects: Project[] = [
  { initials: 'AP', name: 'atlas-payments', owner: 'Dana Whitfield', status: 'Live', updated: '4 min ago' },
  { initials: 'OR', name: 'orbit-reports', owner: 'Marcus Lee', status: 'In review', updated: '26 min ago' },
  { initials: 'HL', name: 'halo-landing', owner: 'Priya Raman', status: 'Live', updated: '1 h ago' },
  { initials: 'VE', name: 'vertex-edge', owner: 'Tom Okafor', status: 'Paused', updated: '3 h ago' },
  { initials: 'SN', name: 'signal-node', owner: 'Ana Duarte', status: 'Live', updated: 'Yesterday' },
];

export interface ActivityItem {
  initials: string;
  segments: Array<{ text: string; strong?: boolean }>;
  time: string;
}

export const activity: ActivityItem[] = [
  {
    initials: 'DW',
    segments: [
      { text: 'Dana', strong: true },
      { text: ' promoted ' },
      { text: 'atlas-payments', strong: true },
      { text: ' to production.' },
    ],
    time: '4 minutes ago',
  },
  {
    initials: 'ML',
    segments: [
      { text: 'Marcus', strong: true },
      { text: ' opened a review on ' },
      { text: 'orbit-reports', strong: true },
      { text: '.' },
    ],
    time: '26 minutes ago',
  },
  {
    initials: 'PR',
    segments: [
      { text: 'Priya', strong: true },
      { text: ' rotated credentials for ' },
      { text: 'halo-landing', strong: true },
      { text: '.' },
    ],
    time: '1 hour ago',
  },
  {
    initials: 'TO',
    segments: [
      { text: 'Tom', strong: true },
      { text: ' paused the ' },
      { text: 'vertex-edge', strong: true },
      { text: ' pipeline.' },
    ],
    time: '3 hours ago',
  },
];

export interface QuotaItem {
  label: string;
  usedLabel: string;
  percent: number;
}

export const quota: QuotaItem[] = [
  { label: 'Build minutes', usedLabel: '1,840 / 3,000', percent: (1840 / 3000) * 100 },
  { label: 'Bandwidth', usedLabel: '412 GB / 750 GB', percent: (412 / 750) * 100 },
  { label: 'Seats', usedLabel: '9 / 12', percent: (9 / 12) * 100 },
];
