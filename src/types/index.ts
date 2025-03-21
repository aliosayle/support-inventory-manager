
export type UserRole = 'admin' | 'employee' | 'user';

export type IssueSeverity = 'low' | 'medium' | 'high';
export type IssueType = 'hardware' | 'software' | 'network';
export type IssueStatus = 'submitted' | 'in-progress' | 'resolved' | 'escalated';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  avatar?: string;
  createdAt: Date;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  submittedBy: string; // User ID
  assignedTo?: string; // User ID (Employee or Admin)
  severity: IssueSeverity;
  type: IssueType;
  status: IssueStatus;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  comments?: IssueComment[];
  relatedStockItems?: string[]; // Stock item IDs
}

export interface IssueComment {
  id: string;
  issueId: string;
  userId: string;
  text: string;
  createdAt: Date;
}

export interface StockItem {
  id: string;
  name: string;
  category: string;
  description: string;
  quantity: number;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  purchaseDate?: Date;
  price?: number;
  location?: string;
  status: 'available' | 'in-use' | 'repair' | 'disposed';
  image?: string;
}

export interface StockUsage {
  id: string;
  stockItemId: string;
  issueId?: string;
  quantity: number;
  assignedTo?: string; // User ID
  date: Date;
  notes?: string;
}

export interface DashboardStats {
  totalIssues: number;
  issuesByStatus: Record<IssueStatus, number>;
  issuesByType: Record<IssueType, number>;
  averageResolutionTime: number; // in hours
  lowStockItems: number;
  recentIssues: Issue[];
}
