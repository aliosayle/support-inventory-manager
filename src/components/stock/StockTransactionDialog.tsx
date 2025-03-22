
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { recordStockTransaction, fetchUsers } from '@/services/stockService';
import { Loader2, Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  
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
        const usersList = await fetchUsers();
        setUsers(usersList || []);
      }
    }
    
    loadUsers();
  }, [isOpen, transactionType]);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    (user.department && user.department.toLowerCase().includes(userSearchTerm.toLowerCase()))
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
                    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={popoverOpen}
                            className={cn(
                              "w-full justify-between",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value
                              ? users.find((user) => user.id === field.value)?.name
                              : "Select a user"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-[350px] p-0">
                        <Command>
                          <CommandInput 
                            placeholder="Search user..." 
                            value={userSearchTerm}
                            onValueChange={setUserSearchTerm}
                          />
                          <CommandEmpty>No user found.</CommandEmpty>
                          {users.length > 0 && (
                            <CommandGroup className="max-h-[300px] overflow-y-auto">
                              {filteredUsers.map((user) => (
                                <CommandItem
                                  key={user.id}
                                  value={user.id}
                                  onSelect={(value) => {
                                    form.setValue("assignedTo", value);
                                    setPopoverOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      user.id === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {user.name} {user.department ? `(${user.department})` : ''}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          )}
                        </Command>
                      </PopoverContent>
                    </Popover>
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
