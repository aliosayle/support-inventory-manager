
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Issue, IssueSeverity, IssueType, User } from '@/types';
import { getUsersByRole } from '@/utils/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';

interface IssueFormProps {
  issue?: Issue;
  onSubmit: (issueData: Partial<Issue>) => void;
  isLoading?: boolean;
}

const IssueForm = ({ issue, onSubmit, isLoading = false }: IssueFormProps) => {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  const [title, setTitle] = useState(issue?.title || '');
  const [description, setDescription] = useState(issue?.description || '');
  const [severity, setSeverity] = useState<IssueSeverity>(issue?.severity || 'medium');
  const [type, setType] = useState<IssueType>(issue?.type || 'software');
  const [assignedTo, setAssignedTo] = useState<string | undefined>(issue?.assignedTo);
  
  const employees = getUsersByRole('employee');
  const admins = getUsersByRole('admin');
  const possibleAssignees = [...employees, ...admins];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }
    
    const issueData: Partial<Issue> = {
      title,
      description,
      severity,
      type,
      submittedBy: user?.id || issue?.submittedBy || '',
    };
    
    if (hasRole(['admin', 'employee']) && assignedTo) {
      issueData.assignedTo = assignedTo;
    }
    
    onSubmit(issueData);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Brief description of the issue"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={type}
                  onValueChange={(value) => setType(value as IssueType)}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hardware">Hardware</SelectItem>
                    <SelectItem value="software">Software</SelectItem>
                    <SelectItem value="network">Network</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="severity">Severity</Label>
                <Select
                  value={severity}
                  onValueChange={(value) => setSeverity(value as IssueSeverity)}
                >
                  <SelectTrigger id="severity">
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {hasRole(['admin']) && (
                <div className="space-y-2">
                  <Label htmlFor="assignedTo">Assign To</Label>
                  <Select
                    value={assignedTo || ''}
                    onValueChange={setAssignedTo}
                  >
                    <SelectTrigger id="assignedTo">
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {possibleAssignees.map((employee: User) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed description of the issue"
                required
                rows={5}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(-1)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : issue ? 'Update Issue' : 'Submit Issue'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default IssueForm;
