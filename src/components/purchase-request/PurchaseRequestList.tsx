
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PurchaseRequest, PurchaseRequestStatus } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';

interface UserInfo {
  name: string;
  phone_number: string | null;
}

// Helper function to map DB data to frontend model
const mapDbPurchaseRequests = (data: any[]): PurchaseRequest[] => {
  return data.map(item => ({
    id: item.id,
    userId: item.user_id,
    bonNumber: item.bon_number,
    bonSigner: item.bon_signer,
    itemName: item.item_name,
    itemDescription: item.item_description,
    itemQuantity: item.item_quantity,
    estimatedPrice: item.estimated_price,
    notes: item.notes,
    status: item.status as PurchaseRequestStatus,
    createdAt: new Date(item.created_at),
    updatedAt: new Date(item.updated_at),
    userInfo: item.custom_users as UserInfo
  }));
};

// Status badge colors
const getStatusBadge = (status: PurchaseRequestStatus) => {
  switch (status) {
    case 'pending':
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
    case 'approved':
      return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Approved</Badge>;
    case 'purchased':
      return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Purchased</Badge>;
    case 'rejected':
      return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

interface PurchaseRequestListProps {
  limit?: number;
  showActions?: boolean;
  onStatusChange?: () => void;
  filterStatus?: PurchaseRequestStatus;
  canApprove?: boolean;
  canReject?: boolean;
}

const PurchaseRequestList = ({ 
  limit, 
  showActions = false, 
  onStatusChange,
  filterStatus,
  canApprove = false,
  canReject = false 
}: PurchaseRequestListProps) => {
  const { user, hasRole } = useAuth();
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequests = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        let query = supabase
          .from('purchase_requests')
          .select('*, custom_users(name, phone_number)')
          .order('created_at', { ascending: false });
          
        // If not admin, only fetch user's own requests
        if (!hasRole('admin')) {
          query = query.eq('user_id', user.id);
        }
        
        // Apply filter by status if provided
        if (filterStatus) {
          query = query.eq('status', filterStatus);
        }
        
        // Apply limit if provided
        if (limit) {
          query = query.limit(limit);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        const mappedRequests = mapDbPurchaseRequests(data || []);
        setRequests(mappedRequests);
      } catch (error: any) {
        console.error('Error fetching purchase requests:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to load purchase requests",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRequests();
  }, [user, hasRole, limit, filterStatus]);

  const handleStatusChange = async (id: string, status: PurchaseRequestStatus) => {
    // Only allow if user has admin role or appropriate permissions
    if (!hasRole('admin') && 
        ((status === 'approved' && !canApprove) || 
         (status === 'rejected' && !canReject) || 
         (status === 'purchased' && !canApprove))) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to perform this action",
        variant: "destructive",
      });
      return;
    }
    
    setUpdating(id);
    try {
      const { error } = await supabase
        .from('purchase_requests')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setRequests(prev => 
        prev.map(request => 
          request.id === id ? { ...request, status } : request
        )
      );
      
      toast({
        title: "Status updated",
        description: `Request status changed to ${status}`,
      });
      
      // Notify parent component
      if (onStatusChange) {
        onStatusChange();
      }
    } catch (error: any) {
      console.error('Error updating request status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update request status",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-5 bg-gray-200 rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No purchase requests found.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <Card key={request.id}>
          <CardHeader className="pb-2 flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-lg">{request.itemName}</CardTitle>
              <div className="text-sm text-muted-foreground">
                BON #{request.bonNumber} • {formatDistanceToNow(request.createdAt, { addSuffix: true })}
                {request.userInfo && (
                  <div className="mt-1 font-medium">
                    Requested by: {request.userInfo.name}
                    {request.userInfo.phone_number && (
                      <span className="ml-2">• {request.userInfo.phone_number}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
            {getStatusBadge(request.status)}
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 text-sm">
                <div>
                  <span className="font-medium">Quantity:</span> {request.itemQuantity}
                </div>
                <div>
                  <span className="font-medium">BON Signer:</span> {request.bonSigner}
                </div>
                {request.estimatedPrice && (
                  <div>
                    <span className="font-medium">Est. Price:</span> ${request.estimatedPrice.toFixed(2)}
                  </div>
                )}
                <div>
                  <span className="font-medium">Total Est.:</span> ${(
                    (request.estimatedPrice || 0) * request.itemQuantity
                  ).toFixed(2)}
                </div>
              </div>
              
              {request.itemDescription && (
                <div className="text-sm mt-2">
                  <span className="font-medium">Description:</span> {request.itemDescription}
                </div>
              )}
              
              {request.notes && (
                <div className="text-sm mt-2">
                  <span className="font-medium">Notes:</span> {request.notes}
                </div>
              )}
              
              {showActions && request.status === 'pending' && (
                <div className="flex gap-2 mt-4">
                  {canApprove && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-green-500 text-green-700 hover:bg-green-50"
                      disabled={!!updating}
                      onClick={() => handleStatusChange(request.id, 'approved')}
                    >
                      {updating === request.id ? 'Updating...' : 'Approve'}
                    </Button>
                  )}
                  {canReject && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-red-500 text-red-700 hover:bg-red-50"
                      disabled={!!updating}
                      onClick={() => handleStatusChange(request.id, 'rejected')}
                    >
                      {updating === request.id ? 'Updating...' : 'Reject'}
                    </Button>
                  )}
                </div>
              )}
              
              {showActions && request.status === 'approved' && canApprove && (
                <div className="flex gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-green-500 text-green-700 hover:bg-green-50"
                    disabled={!!updating}
                    onClick={() => handleStatusChange(request.id, 'purchased')}
                  >
                    {updating === request.id ? 'Updating...' : 'Mark as Purchased'}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PurchaseRequestList;
