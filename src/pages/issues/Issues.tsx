
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Issue } from '@/types';
import IssueList from '@/components/issues/IssueList';
import { toast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { mapDbIssues } from '@/utils/dataMapping';
import { useNavigate, useLocation } from 'react-router-dom';

const Issues = () => {
  const { user, hasRole, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentTab, setCurrentTab] = useState('mine'); // Default to 'mine' for regular users
  const [hasCheckedPermission, setHasCheckedPermission] = useState(false);

  // Check if user has permission to access issues
  useEffect(() => {
    // Only check once to prevent infinite redirects
    if (!hasCheckedPermission) {
      // All users can see the issues page for their own issues
      // Only redirect if there's no user (not authenticated)
      if (!user) {
        toast({
          title: "Access Denied",
          description: "You must be logged in to view issues.",
          variant: "destructive",
        });
        navigate('/dashboard', { replace: true });
      }
      setHasCheckedPermission(true);
    }
  }, [user, navigate, hasCheckedPermission]);

  // Set default tab based on user role and permissions
  useEffect(() => {
    if (hasRole(['admin']) || hasPermission('view_issues')) {
      setCurrentTab('all');
    } else if (hasRole(['employee'])) {
      setCurrentTab('assigned');
    } else {
      setCurrentTab('mine');
    }
  }, [hasRole, hasPermission]);

  // Use React Query for better caching and fetching
  const { data: issues, isLoading } = useQuery({
    queryKey: ['issues', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        let query = supabase.from('issues').select('*');
        
        // Filter issues based on user role and permissions
        if (!hasRole(['admin']) && !hasPermission('view_issues')) {
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
        
        console.log("Fetched issues:", data?.length || 0);
        // Map database issues to frontend format
        return mapDbIssues(data || []);
      } catch (error: any) {
        console.error('Error fetching issues:', error);
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
          {hasRole(['admin']) || hasPermission('view_issues') 
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
        canSeeAllIssues={hasRole(['admin']) || hasPermission('view_issues')}
      />
    </div>
  );
};

export default Issues;
