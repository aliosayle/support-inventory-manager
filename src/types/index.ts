
export type UserRole = 'admin' | 'employee' | 'user';

export type IssueSeverity = 'low' | 'medium' | 'high';
export type IssueType = 'hardware' | 'software' | 'network';
export type IssueStatus = 'submitted' | 'in-progress' | 'resolved' | 'escalated';
export type StockStatus = 'available' | 'in-use' | 'repair' | 'disposed';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  avatar?: string;
  created_at: Date;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  submitted_by: string; // User ID
  assigned_to?: string; // User ID (Employee or Admin)
  severity: IssueSeverity;
  type: IssueType;
  status: IssueStatus;
  created_at: Date;
  updated_at: Date;
  resolved_at?: Date;
  comments?: IssueComment[];
}

export interface IssueComment {
  id: string;
  issue_id: string;
  user_id: string;
  text: string;
  created_at: Date;
}

export interface StockItem {
  id: string;
  name: string;
  category: string;
  description: string;
  quantity: number;
  manufacturer?: string;
  model?: string;
  serial_number?: string;
  purchase_date?: Date;
  price?: number;
  location?: string;
  status: StockStatus;
  image?: string;
}

export interface StockUsage {
  id: string;
  stock_item_id: string;
  issue_id?: string;
  quantity: number;
  assigned_to?: string; // User ID
  date: Date;
  notes?: string;
}

export interface IssueStockItem {
  issue_id: string;
  stock_item_id: string;
}

export interface DashboardStats {
  totalIssues: number;
  issuesByStatus: Record<IssueStatus, number>;
  issuesByType: Record<IssueType, number>;
  averageResolutionTime: number; // in hours
  lowStockItems: number;
  recentIssues: Issue[];
}
