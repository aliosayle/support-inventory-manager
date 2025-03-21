
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Issue } from '@/types';
import { createIssue } from '@/utils/mockData';
import IssueForm from '@/components/issues/IssueForm';
import { toast } from '@/components/ui/use-toast';

const NewIssue = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (issueData: Partial<Issue>) => {
    setIsLoading(true);
    
    try {
      // Add default values for new issue
      const newIssueData = {
        ...issueData,
        status: 'submitted',
      };
      
      // Create the new issue
      createIssue(newIssueData as any);
      
      toast({
        title: "Issue Created",
        description: "Your issue has been successfully submitted.",
      });
      
      // Redirect to issues list
      navigate('/issues');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create the issue. Please try again.",
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
