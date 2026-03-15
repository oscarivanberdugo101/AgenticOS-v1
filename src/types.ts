/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'Active' | 'Processing' | 'Idle' | 'Completed';
  icon: string;
  technologies: string[];
  needsTesting?: boolean;
  progress: number;
  health: 'Healthy' | 'Warning' | 'Critical';
  lastUpdated: string;
  activeAgents: string[];
}

export interface LogEntry {
  id: string;
  timestamp: string;
  agent: string;
  message: string;
  type: 'logic' | 'arch' | 'qa' | 'sec';
}

export interface Activity {
  id: string;
  user: string;
  initials: string;
  action: string;
  target: string;
  time: string;
}
