export interface StatCardData {
  id: string;
  label: string;
  value: string;
  delta: string;
  direction: 'up' | 'down';
}

export const statCards: StatCardData[] = [
  { id: 'active-deploys', label: 'Active deploys', value: '128', delta: '12.4% vs last week', direction: 'up' },
  { id: 'build-success', label: 'Build success', value: '96.2%', delta: '1.8% vs last week', direction: 'up' },
  { id: 'avg-build-time', label: 'Avg build time', value: '3m 41s', delta: '8.1% slower', direction: 'down' },
  { id: 'open-incidents', label: 'Open incidents', value: '2', delta: '1 resolved today', direction: 'up' },
];

export interface DeploymentPoint {
  day: string;
  value: number;
}

export const deploymentVolume: DeploymentPoint[] = [
  { day: 'Mon', value: 62 },
  { day: 'Tue', value: 88 },
  { day: 'Wed', value: 48 },
  { day: 'Thu', value: 100 },
  { day: 'Fri', value: 78 },
  { day: 'Sat', value: 32 },
  { day: 'Sun', value: 58 },
];

export type ProjectStatus = 'Live' | 'In review' | 'Paused';

export interface ProjectRow {
  initials: string;
  name: string;
  owner: string;
  status: ProjectStatus;
  updated: string;
}

export const projects: ProjectRow[] = [
  { initials: 'AP', name: 'atlas-payments', owner: 'Dana Whitfield', status: 'Live', updated: '4 min ago' },
  { initials: 'OR', name: 'orbit-reports', owner: 'Marcus Lee', status: 'In review', updated: '26 min ago' },
  { initials: 'HL', name: 'halo-landing', owner: 'Priya Raman', status: 'Live', updated: '1 h ago' },
  { initials: 'VE', name: 'vertex-edge', owner: 'Tom Okafor', status: 'Paused', updated: '3 h ago' },
  { initials: 'SN', name: 'signal-node', owner: 'Ana Duarte', status: 'Live', updated: 'Yesterday' },
];

export interface ActivityItem {
  initials: string;
  text: string;
  boldParts: string[];
  time: string;
}

export interface ActivityEntry {
  initials: string;
  segments: Array<{ text: string; bold: boolean }>;
  time: string;
}

export const activity: ActivityEntry[] = [
  {
    initials: 'DW',
    segments: [
      { text: 'Dana', bold: true },
      { text: ' promoted ', bold: false },
      { text: 'atlas-payments', bold: true },
      { text: ' to production.', bold: false },
    ],
    time: '4 minutes ago',
  },
  {
    initials: 'ML',
    segments: [
      { text: 'Marcus', bold: true },
      { text: ' opened a review on ', bold: false },
      { text: 'orbit-reports', bold: true },
      { text: '.', bold: false },
    ],
    time: '26 minutes ago',
  },
  {
    initials: 'PR',
    segments: [
      { text: 'Priya', bold: true },
      { text: ' rotated credentials for ', bold: false },
      { text: 'halo-landing', bold: true },
      { text: '.', bold: false },
    ],
    time: '1 hour ago',
  },
  {
    initials: 'TO',
    segments: [
      { text: 'Tom', bold: true },
      { text: ' paused the ', bold: false },
      { text: 'vertex-edge', bold: true },
      { text: ' pipeline.', bold: false },
    ],
    time: '3 hours ago',
  },
];

export interface QuotaItem {
  label: string;
  used: string;
  total: string;
  percent: number;
}

export const quota: QuotaItem[] = [
  { label: 'Build minutes', used: '1,840', total: '3,000', percent: 61 },
  { label: 'Bandwidth', used: '412 GB', total: '750 GB', percent: 55 },
  { label: 'Seats', used: '9', total: '12', percent: 75 },
];

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
