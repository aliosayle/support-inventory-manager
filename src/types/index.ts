
export type UserRole = 'admin' | 'employee' | 'user';

export type IssueSeverity = 'low' | 'medium' | 'high';
export type IssueType = 'hardware' | 'software' | 'network';
export type IssueStatus = 'submitted' | 'in-progress' | 'resolved' | 'escalated';
export type StockStatus = 'available' | 'in-use' | 'repair' | 'disposed';
export type PurchaseRequestStatus = 'pending' | 'approved' | 'purchased' | 'rejected';
export type StockTransactionType = 'in' | 'out';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  company?: string;
  site?: string;
  phoneNumber?: string;
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
  submitterName?: string; // Added to display the name of the submitter
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
  status: StockStatus;
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
  transactionType: StockTransactionType;
  assignedToName?: string; // Added to display the name of the recipient
}

export interface IssueStockItem {
  issueId: string;
  stockItemId: string;
}

export interface PurchaseRequest {
  id: string;
  userId: string;
  bonNumber: string;
  bonSigner: string;
  itemName: string;
  itemDescription?: string;
  itemQuantity: number;
  estimatedPrice?: number;
  notes?: string;
  status: PurchaseRequestStatus;
  createdAt: Date;
  updatedAt: Date;
  userInfo?: {
    name: string;
    phone_number: string | null;
  };
}

export interface DashboardStats {
  totalIssues: number;
  issuesByStatus: Record<IssueStatus, number>;
  issuesByType: Record<IssueType, number>;
  averageResolutionTime: number; // in hours
  lowStockItems: number;
  recentIssues: Issue[];
  unassignedIssues: number; // Added for dashboard
  pendingPurchaseRequests: number; // Added for dashboard
}
