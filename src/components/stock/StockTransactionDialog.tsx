
import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { StockItem, StockTransactionType } from '@/types';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { recordStockTransaction, fetchUsers } from '@/services/stockService';
import { Loader2 } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  department?: string;
}

const stockTransactionSchema = z.object({
  quantity: z.coerce.number().positive({ message: 'Quantity must be a positive number' }),
  assignedTo: z.string().optional(),
  notes: z.string().optional(),
});

type StockTransactionFormValues = z.infer<typeof stockTransactionSchema>;

interface StockTransactionDialogProps {
  stockItem: StockItem | null;
  transactionType: StockTransactionType;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function StockTransactionDialog({
  stockItem,
  transactionType,
  isOpen,
  onClose,
  onSuccess
}: StockTransactionDialogProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const form = useForm<StockTransactionFormValues>({
    resolver: zodResolver(stockTransactionSchema),
    defaultValues: {
      quantity: 1,
      assignedTo: '',
      notes: '',
    },
  });

  useEffect(() => {
    async function loadUsers() {
      if (isOpen && transactionType === 'out') {
        try {
          const usersList = await fetchUsers();
          setUsers(usersList || []);
        } catch (error) {
          console.error('Error loading users:', error);
          setUsers([]);
        }
      }
    }
    
    loadUsers();
  }, [isOpen, transactionType]);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.department && user.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const onSubmit = async (data: StockTransactionFormValues) => {
    if (!stockItem) return;
    
    setIsLoading(true);
    try {
      const success = await recordStockTransaction(
        stockItem.id,
        data.quantity,
        transactionType,
        data.assignedTo,
        data.notes
      );
      
      if (success) {
        form.reset();
        onSuccess();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {transactionType === 'in' ? 'Stock In' : 'Stock Out'} - {stockItem?.name}
          </DialogTitle>
          <DialogDescription>
            {transactionType === 'in' 
              ? 'Add items to inventory' 
              : 'Remove items from inventory and assign to a user'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1} 
                      max={transactionType === 'out' ? stockItem?.quantity : undefined}
                      {...field} 
                    />
                  </FormControl>
                  {transactionType === 'out' && stockItem && (
                    <FormDescription>
                      Available: {stockItem.quantity} items
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {transactionType === 'out' && (
              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Assign To *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a user" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <Input 
                          placeholder="Search..." 
                          className="mb-2" 
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {filteredUsers.length === 0 ? (
                          <p className="text-center py-2 text-sm text-muted-foreground">No users found</p>
                        ) : (
                          filteredUsers.map(user => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name} {user.department ? `(${user.department})` : ''}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Add notes about this transaction" 
                      className="resize-none" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {transactionType === 'in' ? 'Add to Inventory' : 'Remove from Inventory'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
