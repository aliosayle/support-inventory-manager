
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PurchaseRequestForm from '@/components/purchase-request/PurchaseRequestForm';
import PurchaseRequestList from '@/components/purchase-request/PurchaseRequestList';

const PurchaseRequests = () => {
  const { hasRole, hasPermission } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  
  const handleStatusChange = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  const canCreateRequest = hasPermission('create_purchase_request');
  const canApproveRequest = hasPermission('approve_purchase_request');
  const canRejectRequest = hasPermission('reject_purchase_request');
  const canManageAllRequests = hasRole('admin') || (canApproveRequest && canRejectRequest);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Purchase Requests</h1>
        <p className="text-muted-foreground">
          Submit and manage requests for IT department purchases
        </p>
      </div>
      
      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests">My Requests</TabsTrigger>
          {canCreateRequest && <TabsTrigger value="new">New Request</TabsTrigger>}
          {canManageAllRequests && (
            <TabsTrigger value="all">All Requests</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="requests" className="space-y-4">
          <PurchaseRequestList key={`my-requests-${refreshKey}`} />
        </TabsContent>
        
        {canCreateRequest && (
          <TabsContent value="new">
            <PurchaseRequestForm />
          </TabsContent>
        )}
        
        {canManageAllRequests && (
          <TabsContent value="all" className="space-y-4">
            <PurchaseRequestList 
              key={`all-requests-${refreshKey}`} 
              showActions 
              onStatusChange={handleStatusChange}
              canApprove={canApproveRequest}
              canReject={canRejectRequest}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default PurchaseRequests;
