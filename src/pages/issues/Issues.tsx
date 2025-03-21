
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Issue } from '@/types';
import IssueList from '@/components/issues/IssueList';
import { toast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { mapDbIssues } from '@/utils/dataMapping';

const Issues = () => {
  const { user, hasRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentTab, setCurrentTab] = useState('all');

  // Use React Query for better caching and fetching
  const { data: issues, isLoading } = useQuery({
    queryKey: ['issues', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        let query = supabase.from('issues').select('*');
        
        // Filter issues based on user role
        if (!hasRole(['admin'])) {
          if (hasRole(['employee'])) {
            // Employee sees only assigned issues
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
        return mapDbIssues(data || []);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch issues",
          variant: "destructive",
        });
        return [];
      }
    },
    staleTime: 60000, // 1 minute
  });

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
        issues={issues || []} 
        isLoading={isLoading}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
      />
    </div>
  );
};

export default Issues;
