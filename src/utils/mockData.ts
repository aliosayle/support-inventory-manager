
import { User, Issue, StockItem, IssueSeverity, IssueType, IssueStatus, UserRole } from '@/types';

// Users
export const users: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    department: 'IT',
    createdAt: new Date('2023-01-01'),
  },
  {
    id: '2',
    name: 'John Smith',
    email: 'john@example.com',
    role: 'employee',
    department: 'IT',
    createdAt: new Date('2023-01-05'),
  },
  {
    id: '3',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    role: 'employee',
    department: 'IT',
    createdAt: new Date('2023-01-10'),
  },
  {
    id: '4',
    name: 'Michael Brown',
    email: 'michael@example.com',
    role: 'user',
    department: 'Marketing',
    createdAt: new Date('2023-01-15'),
  },
  {
    id: '5',
    name: 'Emily Davis',
    email: 'emily@example.com',
    role: 'user',
    department: 'Finance',
    createdAt: new Date('2023-01-20'),
  },
];

// Issues
export const issues: Issue[] = [
  {
    id: '1',
    title: 'Cannot access email',
    description: 'Getting error message when trying to open Outlook',
    submittedBy: '4',
    assignedTo: '2',
    severity: 'medium',
    type: 'software',
    status: 'in-progress',
    createdAt: new Date('2023-06-01T10:30:00'),
    updatedAt: new Date('2023-06-01T14:20:00'),
    comments: [
      {
        id: '1',
        issueId: '1',
        userId: '4',
        text: 'I\'ve tried restarting my computer but it didn\'t help.',
        createdAt: new Date('2023-06-01T11:15:00'),
      },
      {
        id: '2',
        issueId: '1',
        userId: '2',
        text: 'I\'ll look into this. Can you provide the exact error message?',
        createdAt: new Date('2023-06-01T14:20:00'),
      },
    ],
  },
  {
    id: '2',
    title: 'Printer not working',
    description: 'The printer on the 3rd floor is showing offline status',
    submittedBy: '5',
    assignedTo: '3',
    severity: 'high',
    type: 'hardware',
    status: 'submitted',
    createdAt: new Date('2023-06-02T09:15:00'),
    updatedAt: new Date('2023-06-02T09:15:00'),
  },
  {
    id: '3',
    title: 'VPN connection issues',
    description: 'Cannot establish VPN connection from home',
    submittedBy: '4',
    assignedTo: '1',
    severity: 'high',
    type: 'network',
    status: 'resolved',
    createdAt: new Date('2023-05-28T16:40:00'),
    updatedAt: new Date('2023-05-30T11:25:00'),
    resolvedAt: new Date('2023-05-30T11:25:00'),
    comments: [
      {
        id: '3',
        issueId: '3',
        userId: '4',
        text: 'I\'ve tried using both my home WiFi and mobile hotspot, neither works.',
        createdAt: new Date('2023-05-29T10:00:00'),
      },
      {
        id: '4',
        issueId: '3',
        userId: '1',
        text: 'There was a configuration issue with the VPN server. It has been fixed now.',
        createdAt: new Date('2023-05-30T11:25:00'),
      },
    ],
  },
  {
    id: '4',
    title: 'New laptop request',
    description: 'Need a new laptop for the new marketing manager starting next week',
    submittedBy: '4',
    severity: 'medium',
    type: 'hardware',
    status: 'submitted',
    createdAt: new Date('2023-06-03T14:10:00'),
    updatedAt: new Date('2023-06-03T14:10:00'),
    relatedStockItems: ['3'],
  },
  {
    id: '5',
    title: 'Software installation',
    description: 'Need Adobe Creative Suite installed on my workstation',
    submittedBy: '5',
    assignedTo: '2',
    severity: 'low',
    type: 'software',
    status: 'in-progress',
    createdAt: new Date('2023-06-01T11:05:00'),
    updatedAt: new Date('2023-06-02T09:30:00'),
  },
];

// Stock Items
export const stockItems: StockItem[] = [
  {
    id: '1',
    name: 'Dell Monitor 27"',
    category: 'Display',
    description: 'Dell UltraSharp 27" 4K Monitor',
    quantity: 5,
    manufacturer: 'Dell',
    model: 'U2720Q',
    purchaseDate: new Date('2023-01-15'),
    price: 449.99,
    location: 'Storage Room A',
    status: 'available',
    image: 'https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/peripherals/monitors/u-series/u2720q/global-spi/monitor-u2720q-hero-504x350-ng.psd?fmt=jpg&wid=504&hei=350',
  },
  {
    id: '2',
    name: 'HP LaserJet Printer',
    category: 'Printer',
    description: 'HP LaserJet Pro M404dn',
    quantity: 2,
    manufacturer: 'HP',
    model: 'M404dn',
    purchaseDate: new Date('2023-02-10'),
    price: 329.99,
    location: 'Storage Room B',
    status: 'available',
    image: 'https://ssl-product-images.www8-hp.com/digmedialib/prodimg/lowres/c06299283.png',
  },
  {
    id: '3',
    name: 'MacBook Pro 16"',
    category: 'Laptop',
    description: 'Apple MacBook Pro 16" with M2 Pro',
    quantity: 3,
    manufacturer: 'Apple',
    model: 'MacBook Pro 16" (2023)',
    purchaseDate: new Date('2023-03-05'),
    price: 2499.99,
    location: 'Storage Room A',
    status: 'available',
    image: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/mbp16-spacegray-select-202301?wid=904&hei=840&fmt=jpeg&qlt=90&.v=1671304673229',
  },
  {
    id: '4',
    name: 'Logitech MX Master 3',
    category: 'Peripherals',
    description: 'Wireless mouse',
    quantity: 10,
    manufacturer: 'Logitech',
    model: 'MX Master 3',
    purchaseDate: new Date('2023-02-20'),
    price: 99.99,
    location: 'Storage Room B',
    status: 'available',
    image: 'https://resource.logitech.com/content/dam/logitech/en/products/mice/mx-master-3s/gallery/mx-master-3s-mouse-top-view-graphite.png',
  },
  {
    id: '5',
    name: 'Network Switch',
    category: 'Network',
    description: '24-Port Gigabit Ethernet Smart Managed Switch',
    quantity: 1,
    manufacturer: 'Cisco',
    model: 'SG350-28',
    purchaseDate: new Date('2023-01-25'),
    price: 399.99,
    location: 'Server Room',
    status: 'in-use',
    image: 'https://www.cisco.com/c/dam/en/us/products/switches/350-series-managed-switches/350x-series-managed-switches_black_1200x675.png',
  },
];

// Helper function to get users by role
export const getUsersByRole = (role: UserRole): User[] => {
  return users.filter(user => user.role === role);
};

// Helper function to get issues by status
export const getIssuesByStatus = (status: IssueStatus): Issue[] => {
  return issues.filter(issue => issue.status === status);
};

// Helper function to get issues assigned to a user
export const getIssuesByAssignee = (userId: string): Issue[] => {
  return issues.filter(issue => issue.assignedTo === userId);
};

// Helper function to get issues submitted by a user
export const getIssuesBySubmitter = (userId: string): Issue[] => {
  return issues.filter(issue => issue.submittedBy === userId);
};

// Helper function to get low stock items (quantity < 3)
export const getLowStockItems = (): StockItem[] => {
  return stockItems.filter(item => item.quantity < 3);
};

// Helper function to get stock items by category
export const getStockItemsByCategory = (category: string): StockItem[] => {
  return stockItems.filter(item => item.category === category);
};

// Helper function to get user by ID
export const getUserById = (id: string): User | undefined => {
  return users.find(user => user.id === id);
};

// Helper function to get issue by ID
export const getIssueById = (id: string): Issue | undefined => {
  return issues.find(issue => issue.id === id);
};

// Helper function to get stock item by ID
export const getStockItemById = (id: string): StockItem | undefined => {
  return stockItems.find(item => item.id === id);
};

// Helper to create a new issue
export const createIssue = (issue: Omit<Issue, 'id' | 'createdAt' | 'updatedAt'>): Issue => {
  const newIssue: Issue = {
    ...issue,
    id: `${issues.length + 1}`,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  issues.push(newIssue);
  return newIssue;
};

// Helper to update an issue
export const updateIssue = (issueId: string, update: Partial<Issue>): Issue | undefined => {
  const index = issues.findIndex(issue => issue.id === issueId);
  if (index === -1) return undefined;
  
  issues[index] = {
    ...issues[index],
    ...update,
    updatedAt: new Date(),
  };
  
  return issues[index];
};
