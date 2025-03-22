
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Issue } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import IssueForm from '@/components/issues/IssueForm';
import { toast } from '@/components/ui/use-toast';
import { mapIssueToDbIssue } from '@/utils/dataMapping';
import { useAuth } from '@/context/AuthContext';

const NewIssue = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [hasCheckedPermission, setHasCheckedPermission] = useState(false);
  const { hasRole, hasPermission } = useAuth();

  // Redirect if user doesn't have permission to create issues
  useEffect(() => {
    // Avoid running this effect more than once to prevent infinite redirects
    if (!hasCheckedPermission) {
      if (!hasRole(['admin']) && !hasPermission('create_issue')) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to create issues.",
          variant: "destructive",
        });
        navigate('/issues', { replace: true });
      }
      setHasCheckedPermission(true);
    }
  }, [hasRole, hasPermission, navigate, hasCheckedPermission]);

  const handleSubmit = async (issueData: Partial<Issue>) => {
    setIsLoading(true);
    
    try {
      // Add default values for new issue
      const newIssueData = {
        ...issueData,
        status: 'submitted' as const,
      };
      
      // Convert frontend Issue to database issue format
      const dbIssueData = mapIssueToDbIssue(newIssueData);
      
      // Ensure required fields are present
      if (!dbIssueData.description || !dbIssueData.submitted_by || !dbIssueData.title || !dbIssueData.type) {
        throw new Error("Missing required issue fields");
      }
      
      console.log("Submitting issue with data:", dbIssueData);
      
      // Create the new issue in the database with specific typing
      const { data, error } = await supabase
        .from('issues')
        .insert({
          title: dbIssueData.title,
          description: dbIssueData.description,
          submitted_by: dbIssueData.submitted_by,
          type: dbIssueData.type,
          severity: dbIssueData.severity || 'medium',
          status: dbIssueData.status || 'submitted',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error("Database error:", error);
        throw error;
      }
      
      toast({
        title: "Issue Created",
        description: "Your issue has been successfully submitted.",
      });
      
      // Redirect to issues list
      navigate('/issues');
    } catch (error: any) {
      console.error("Error creating issue:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create the issue. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Submit New Issue</h1>
        <p className="text-muted-foreground">
          Fill out the form below to submit a new IT support issue.
        </p>
      </div>

      <IssueForm 
        onSubmit={handleSubmit} 
        isLoading={isLoading}
      />
    </div>
  );
};

export default NewIssue;
