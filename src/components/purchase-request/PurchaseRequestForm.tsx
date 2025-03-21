
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const formSchema = z.object({
  bonNumber: z.string().min(2, 'BON number is required'),
  bonSigner: z.string().min(2, 'BON signer name is required'),
  itemName: z.string().min(2, 'Item name is required'),
  itemDescription: z.string().optional(),
  itemQuantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  estimatedPrice: z.coerce.number().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const PurchaseRequestForm = () => {
  const { user, refreshProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customUserFetched, setCustomUserFetched] = useState(false);
  const [customUserId, setCustomUserId] = useState<string | null>(null);

  // Fetch custom_users ID that matches the authenticated user's email
  useEffect(() => {
    const fetchCustomUser = async () => {
      if (user && !customUserFetched) {
        try {
          console.log("Fetching custom user for email:", user.email);
          const { data, error } = await supabase
            .from('custom_users')
            .select('id')
            .eq('email', user.email)
            .maybeSingle();

          if (error) {
            console.error('Error fetching custom user:', error);
            return;
          }

          if (data) {
            console.log("Found custom user with ID:", data.id);
            setCustomUserId(data.id);
          } else {
            console.log("No custom user found for email:", user.email);
          }
        } catch (err) {
          console.error('Error in fetchCustomUser:', err);
        } finally {
          setCustomUserFetched(true);
        }
      }
    };

    fetchCustomUser();
  }, [user, customUserFetched]);

  useEffect(() => {
    if (!user) {
      refreshProfile();
    }
  }, [user, refreshProfile]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bonNumber: '',
      bonSigner: '',
      itemName: '',
      itemDescription: '',
      itemQuantity: 1,
      estimatedPrice: undefined,
      notes: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'You must be logged in to submit a purchase request',
        variant: 'destructive',
      });
      return;
    }

    if (!customUserId) {
      toast({
        title: 'User profile not found',
        description: 'Your user profile is not properly set up in the system',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Submitting purchase request for custom user ID:', customUserId);
      
      const { error } = await supabase.from('purchase_requests').insert({
        user_id: customUserId,
        bon_number: data.bonNumber,
        bon_signer: data.bonSigner,
        item_name: data.itemName,
        item_description: data.itemDescription,
        item_quantity: data.itemQuantity,
        estimated_price: data.estimatedPrice,
        notes: data.notes,
        status: 'pending',
      });

      if (error) {
        console.error('Error details:', error);
        throw error;
      }

      toast({
        title: 'Purchase request submitted',
        description: 'Your request has been submitted successfully',
      });

      form.reset();
    } catch (error: any) {
      console.error('Error submitting purchase request:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit purchase request',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Submit Purchase Request</CardTitle>
        <CardDescription>
          Request IT department to purchase items for you
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bonNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>BON Number*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter BON number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bonSigner"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>BON Signer Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Name of person who signed the BON" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="itemName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Name*</FormLabel>
                  <FormControl>
                    <Input placeholder="Name of the item to purchase" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="itemDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Item Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Provide details about the item (brand, model, specifications)" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="itemQuantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity*</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="estimatedPrice"
                render={({ field: { value, ...fieldProps }}) => (
                  <FormItem>
                    <FormLabel>Estimated Price</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="Optional" 
                        value={value === undefined ? '' : value}
                        {...fieldProps} 
                      />
                    </FormControl>
                    <FormDescription>If known (optional)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any additional information or justification for this purchase" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Submitting...' : 'Submit Purchase Request'}
            </Button>
            
            {!user && (
              <div className="p-4 border border-yellow-300 bg-yellow-50 text-yellow-800 rounded mt-4">
                You must be logged in to submit a purchase request. Please log in and try again.
              </div>
            )}
            
            {user && !customUserId && customUserFetched && (
              <div className="p-4 border border-red-300 bg-red-50 text-red-800 rounded mt-4">
                Your user profile could not be found in the system. Please contact the administrator.
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PurchaseRequestForm;
