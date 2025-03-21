import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Issue, IssueType, IssueSeverity } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface IssueFormProps {
  initialData?: Partial<Issue>;
  onSubmit: (data: Partial<Issue>) => void;
  isLoading: boolean;
}

const IssueForm = ({ initialData, onSubmit, isLoading }: IssueFormProps) => {
  const { user } = useAuth();
  
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [type, setType] = useState<IssueType>(initialData?.type || 'hardware');
  const [severity, setSeverity] = useState<IssueSeverity>(initialData?.severity || 'medium');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const issueData: Partial<Issue> = {
      title,
      description,
      type,
      severity,
      submittedBy: user?.id || '',
    };
    
    onSubmit(issueData);
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            Issue Title
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Brief description of the issue"
            required
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="type" className="text-sm font-medium">
              Issue Type
            </label>
            <Select
              value={type}
              onValueChange={(value: IssueType) => setType(value)}
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
          
          <div className="space-y-2">
            <label htmlFor="severity" className="text-sm font-medium">
              Severity
            </label>
            <Select
              value={severity}
              onValueChange={(value: IssueSeverity) => setSeverity(value)}
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
        </div>
        
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed description of the issue"
            rows={5}
            required
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Submitting...' : initialData?.id ? 'Update Issue' : 'Submit Issue'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default IssueForm;
