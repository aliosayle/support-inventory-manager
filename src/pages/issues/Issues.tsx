
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Issue } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import IssueList from '@/components/issues/IssueList';
import { toast } from '@/components/ui/use-toast';
import { mapDbIssues } from '@/utils/dataMapping';

const Issues = () => {
  const { user, hasRole } = useAuth();
  const [displayedIssues, setDisplayedIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchIssues = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        let query = supabase.from('issues').select('*');
        
        // Filter issues based on user role
        if (!hasRole(['admin'])) {
          if (hasRole(['employee'])) {
            // Employee sees assigned issues
            query = query.eq('assigned_to', user.id);
          } else {
            // Regular user sees submitted issues
            query = query.eq('submitted_by', user.id);
          }
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        // Map database issues to frontend format
        const mappedIssues = mapDbIssues(data || []);
        setDisplayedIssues(mappedIssues);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch issues",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchIssues();
  }, [user, hasRole]);

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

      <IssueList issues={displayedIssues} isLoading={isLoading} />
    </div>
  );
};

export default Issues;
