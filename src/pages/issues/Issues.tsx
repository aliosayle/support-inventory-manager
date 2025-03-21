
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Issue } from '@/types';
import { issues, updateIssue, getIssuesByAssignee, getIssuesBySubmitter } from '@/utils/mockData';
import IssueList from '@/components/issues/IssueList';
import { toast } from '@/components/ui/use-toast';

const Issues = () => {
  const { user, hasRole } = useAuth();
  const [displayedIssues, setDisplayedIssues] = useState<Issue[]>([]);

  useEffect(() => {
    if (user) {
      let userIssues: Issue[];
      
      if (hasRole('admin')) {
        // Admin sees all issues
        userIssues = issues;
      } else if (hasRole('employee')) {
        // Employee sees assigned issues
        userIssues = getIssuesByAssignee(user.id);
      } else {
        // User sees submitted issues
        userIssues = getIssuesBySubmitter(user.id);
      }
      
      setDisplayedIssues(userIssues);
    }
  }, [user, hasRole]);

  const handleUpdateStatus = (issueId: string, status: string) => {
    try {
      updateIssue(issueId, { status: status as any });
      
      // Update UI
      setDisplayedIssues(prev => 
        prev.map(issue => 
          issue.id === issueId ? { ...issue, status: status as any } : issue
        )
      );
      
      toast({
        title: "Status Updated",
        description: `Issue has been marked as ${status}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update issue status.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Issues</h1>
        <p className="text-muted-foreground">
          {hasRole(['admin']) 
            ? 'Manage and track all IT support issues.'
            : hasRole(['employee'])
              ? 'View and manage your assigned issues.'
              : 'View and track your submitted issues.'}
        </p>
      </div>

      <IssueList 
        issues={displayedIssues} 
        onUpdateStatus={handleUpdateStatus} 
      />
    </div>
  );
};

export default Issues;
