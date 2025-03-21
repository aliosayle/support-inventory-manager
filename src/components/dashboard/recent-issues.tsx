
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { IssueStatus } from '@/types/index';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface Issue {
  id: string;
  title: string;
  status: IssueStatus;
  submitterName?: string;
  type: string;
  severity: string;
  created_at: string;
}

export function RecentIssues() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecentIssues() {
      try {
        // Get most recent issues
        const { data: issuesData, error: issuesError } = await supabase
          .from('issues')
          .select(`
            id,
            title,
            status,
            type,
            severity,
            created_at,
            submitted_by
          `)
          .order('created_at', { ascending: false })
          .limit(5);

        if (issuesError) throw issuesError;
        
        if (!issuesData || issuesData.length === 0) {
          setIssues([]);
          setLoading(false);
          return;
        }

        // Get user details for the submitters
        const userIds = issuesData.map(issue => issue.submitted_by).filter(Boolean);
        
        const { data: usersData, error: usersError } = await supabase
          .from('custom_users')
          .select('id, name')
          .in('id', userIds);

        if (usersError) throw usersError;

        // Map user names to issues
        const userMap = new Map();
        usersData?.forEach(user => userMap.set(user.id, user.name));

        const issuesWithNames = issuesData.map(issue => ({
          ...issue,
          submitterName: userMap.get(issue.submitted_by) || 'Unknown'
        }));

        setIssues(issuesWithNames);
      } catch (error) {
        console.error('Error fetching recent issues:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRecentIssues();
  }, []);

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

  if (loading) {
    return (
      <div className="space-y-8">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="flex items-center">
            <div className="h-9 w-9 rounded-full bg-muted"></div>
            <div className="ml-4 space-y-1">
              <div className="h-4 w-[200px] bg-muted rounded"></div>
              <div className="h-3 w-[150px] bg-muted rounded"></div>
            </div>
            <div className="ml-auto">
              <div className="h-6 w-[80px] bg-muted rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (issues.length === 0) {
    return <div className="text-center text-muted-foreground py-8">No recent issues found</div>;
  }

  return (
    <div className="space-y-8">
      {issues.map((issue) => (
        <div key={issue.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarFallback>{issue.submitterName?.substring(0, 2) || 'U'}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">
              <Link to={`/issues/${issue.id}`} className="hover:underline">
                {issue.title}
              </Link>
            </p>
            <p className="text-sm text-muted-foreground">{issue.submitterName}</p>
          </div>
          <div className="ml-auto font-medium">
            <Button variant="ghost" size="sm" className={getStatusButtonClass(issue.status)}>
              {issue.status.charAt(0).toUpperCase() + issue.status.slice(1).replace('-', ' ')}
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
