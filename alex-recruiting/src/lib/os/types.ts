export type OSActionKind = "operator" | "link";
export type OSPriorityStatus = "ready" | "attention" | "blocked";

export interface OSMetric {
  label: string;
  value: string;
  detail: string;
}

export interface OSPriority {
  id: string;
  title: string;
  summary: string;
  detail: string;
  status: OSPriorityStatus;
  command?: string;
  href?: string;
  actionLabel: string;
  actionKind: OSActionKind;
}

export interface OSWorkflowStep {
  label: string;
  detail: string;
}

export interface OSWorkflow {
  id: string;
  title: string;
  summary: string;
  metric: string;
  href: string;
  hrefLabel: string;
  command?: string;
  actionLabel: string;
  actionKind: OSActionKind;
  steps: OSWorkflowStep[];
}

export interface OSActivityItem {
  id: string;
  label: string;
  detail: string;
  timeLabel: string;
}

export interface OSTeamSpotlight {
  id: string;
  name: string;
  role: string;
  ownership: string;
  note: string;
}

export interface OSBriefingResponse {
  generatedAt: string;
  headline: string;
  summary: string;
  metrics: OSMetric[];
  priorities: OSPriority[];
  workflows: OSWorkflow[];
  activity: OSActivityItem[];
  operatorPrompts: string[];
  team: OSTeamSpotlight[];
}

export interface OSOperatorCard {
  id: string;
  title: string;
  detail: string;
  meta?: string;
  href?: string;
  hrefLabel?: string;
  command?: string;
  commandLabel?: string;
}

export interface OSOperatorResponse {
  status: "success" | "info" | "warning" | "error";
  message: string;
  cards?: OSOperatorCard[];
  followUpPrompts?: string[];
  focusPath?: string;
}
