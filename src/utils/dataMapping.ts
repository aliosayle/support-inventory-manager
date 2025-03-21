
/**
 * Utility functions to map between snake_case database fields and camelCase frontend types
 */

import { User, Issue, IssueComment, StockItem, StockUsage } from '@/types';

// Map database user to frontend User
export const mapDbUserToUser = (dbUser: any): User => {
  return {
    id: dbUser.id,
    name: dbUser.name,
    email: dbUser.email,
    role: dbUser.role,
    department: dbUser.department,
    avatar: dbUser.avatar,
    createdAt: new Date(dbUser.created_at)
  };
};

// Map database issue to frontend Issue
export const mapDbIssueToIssue = (dbIssue: any): Issue => {
  return {
    id: dbIssue.id,
    title: dbIssue.title,
    description: dbIssue.description,
    submittedBy: dbIssue.submitted_by,
    assignedTo: dbIssue.assigned_to,
    severity: dbIssue.severity,
    type: dbIssue.type,
    status: dbIssue.status,
    createdAt: new Date(dbIssue.created_at),
    updatedAt: new Date(dbIssue.updated_at),
    resolvedAt: dbIssue.resolved_at ? new Date(dbIssue.resolved_at) : undefined,
    comments: dbIssue.comments?.map(mapDbCommentToComment)
  };
};

// Map frontend Issue to database issue
export const mapIssueToDbIssue = (issue: Partial<Issue>): Record<string, any> => {
  const dbIssue: Record<string, any> = {};
  
  if (issue.id !== undefined) dbIssue.id = issue.id;
  if (issue.title !== undefined) dbIssue.title = issue.title;
  if (issue.description !== undefined) dbIssue.description = issue.description;
  if (issue.submittedBy !== undefined) dbIssue.submitted_by = issue.submittedBy;
  if (issue.assignedTo !== undefined) dbIssue.assigned_to = issue.assignedTo;
  if (issue.severity !== undefined) dbIssue.severity = issue.severity;
  if (issue.type !== undefined) dbIssue.type = issue.type;
  if (issue.status !== undefined) dbIssue.status = issue.status;
  if (issue.createdAt !== undefined) dbIssue.created_at = issue.createdAt;
  if (issue.updatedAt !== undefined) dbIssue.updated_at = issue.updatedAt;
  if (issue.resolvedAt !== undefined) dbIssue.resolved_at = issue.resolvedAt;
  
  // Make sure to return a typed object that matches Supabase's expectations
  return dbIssue;
};

// Map database comment to frontend IssueComment
export const mapDbCommentToComment = (dbComment: any): IssueComment => {
  return {
    id: dbComment.id,
    issueId: dbComment.issue_id,
    userId: dbComment.user_id,
    text: dbComment.text,
    createdAt: new Date(dbComment.created_at)
  };
};

// Map database stock item to frontend StockItem
export const mapDbStockItemToStockItem = (dbStockItem: any): StockItem => {
  return {
    id: dbStockItem.id,
    name: dbStockItem.name,
    category: dbStockItem.category,
    description: dbStockItem.description,
    quantity: dbStockItem.quantity,
    manufacturer: dbStockItem.manufacturer,
    model: dbStockItem.model,
    serialNumber: dbStockItem.serial_number,
    purchaseDate: dbStockItem.purchase_date ? new Date(dbStockItem.purchase_date) : undefined,
    price: dbStockItem.price,
    location: dbStockItem.location,
    status: dbStockItem.status,
    image: dbStockItem.image
  };
};

// Map database stock usage to frontend StockUsage
export const mapDbStockUsageToStockUsage = (dbStockUsage: any): StockUsage => {
  return {
    id: dbStockUsage.id,
    stockItemId: dbStockUsage.stock_item_id,
    issueId: dbStockUsage.issue_id,
    quantity: dbStockUsage.quantity,
    assignedTo: dbStockUsage.assigned_to,
    date: new Date(dbStockUsage.date),
    notes: dbStockUsage.notes
  };
};

// Helper to convert arrays of database objects to frontend types
export const mapDbUsers = (dbUsers: any[]): User[] => dbUsers.map(mapDbUserToUser);
export const mapDbIssues = (dbIssues: any[]): Issue[] => dbIssues.map(mapDbIssueToIssue);
export const mapDbStockItems = (dbStockItems: any[]): StockItem[] => dbStockItems.map(mapDbStockItemToStockItem);
