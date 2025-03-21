
import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Issue, IssueStatus } from '@/types/index';

const mockIssues: Issue[] = [
  {
    id: '1',
    title: 'Printer not working',
    description: 'The printer on 3rd floor is not responding',
    submittedBy: 'user1',
    severity: 'medium',
    type: 'hardware',
    status: 'submitted',
    createdAt: new Date(),
    updatedAt: new Date(),
    submitterName: 'John Doe'
  },
  {
    id: '2',
    title: 'Email not syncing',
    description: 'Email is not syncing on mobile devices',
    submittedBy: 'user2',
    severity: 'high',
    type: 'software',
    status: 'in-progress',
    createdAt: new Date(),
    updatedAt: new Date(),
    submitterName: 'Jane Smith'
  },
  {
    id: '3',
    title: 'Wifi connectivity issues',
    description: 'Intermittent Wifi on the 2nd floor',
    submittedBy: 'user3',
    severity: 'high',
    type: 'network',
    status: 'escalated',
    createdAt: new Date(),
    updatedAt: new Date(),
    submitterName: 'Mike Johnson'
  },
  {
    id: '4',
    title: 'Monitor not displaying',
    description: 'External monitor not recognized by laptop',
    submittedBy: 'user4',
    severity: 'low',
    type: 'hardware',
    status: 'resolved',
    createdAt: new Date(),
    updatedAt: new Date(),
    resolvedAt: new Date(),
    submitterName: 'Sarah Williams'
  },
];

export function RecentIssues() {
  return (
    <div className="space-y-8">
      {mockIssues.map((issue) => (
        <div key={issue.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{issue.submitterName?.substring(0, 2) || 'U'}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{issue.title}</p>
            <p className="text-sm text-muted-foreground">{issue.submitterName}</p>
          </div>
          <div className="ml-auto font-medium">
            <Button variant="ghost" size="sm" className={getStatusButtonClass(issue.status)}>
              {issue.status}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function getStatusButtonClass(status: IssueStatus): string {
  switch (status) {
    case 'submitted':
      return 'text-blue-500';
    case 'in-progress':
      return 'text-yellow-500';
    case 'escalated':
      return 'text-red-500';
    case 'resolved':
      return 'text-green-500';
    default:
      return '';
  }
}
