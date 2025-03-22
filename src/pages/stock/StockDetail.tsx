
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StockItem } from '@/types';
import { fetchStockItemById } from '@/services/stockService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, Edit, Package, Trash2 } from 'lucide-react';
import { StockTransactionsPanel } from '@/components/stock/StockTransactionsPanel';

export default function StockDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<StockItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStockItem = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const data = await fetchStockItemById(id);
      setItem(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStockItem();
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-2">Item Not Found</h2>
        <p className="text-muted-foreground mb-4">The requested inventory item could not be found.</p>
        <Button onClick={() => navigate('/stock')}>
          <ChevronLeft size={16} className="mr-2" />
          Back to Inventory
        </Button>
      </div>
    );
  }

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    }).format(new Date(date));
  };
  
  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/stock')}>
            <ChevronLeft size={16} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{item.name}</h1>
            <p className="text-muted-foreground">
              {item.category} • ID: {item.id.substring(0, 8)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <a href={`/stock/${item.id}/edit`}>
              <Edit size={16} className="mr-2" />
              Edit
            </a>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Tabs defaultValue="details">
            <TabsList className="mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="space-y-4">
              <div className="aspect-video relative rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="object-contain w-full h-full"
                  />
                ) : (
                  <Package size={64} className="text-muted-foreground/40" />
                )}
              </div>
              
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Item Information</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                    <p>{item.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Category</h3>
                    <p>{item.category}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                    <p className="capitalize">{item.status}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Quantity</h3>
                    <p>{item.quantity}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Manufacturer</h3>
                    <p>{item.manufacturer || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Model</h3>
                    <p>{item.model || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Serial Number</h3>
                    <p>{item.serialNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Purchase Date</h3>
                    <p>{formatDate(item.purchaseDate)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Price</h3>
                    <p>{formatCurrency(item.price)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                    <p>{item.location || 'N/A'}</p>
                  </div>
                </div>
                
                {item.description && (
                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                    <p className="text-sm">{item.description}</p>
                  </div>
                )}
              </Card>
            </TabsContent>
            
            <TabsContent value="transactions">
              <Card className="p-6">
                <StockTransactionsPanel 
                  stockItem={item} 
                  onStockUpdated={loadStockItem} 
                />
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div>
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Inventory Status</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Current Quantity</h3>
                <p className="text-3xl font-bold">{item.quantity}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                <p className="capitalize text-lg">{item.status}</p>
              </div>
              {item.price && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Total Value</h3>
                  <p className="text-xl font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                </div>
              )}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                <p>N/A</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
