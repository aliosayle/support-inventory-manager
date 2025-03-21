
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchStockItemById } from '@/services/stockService';
import StockForm from '@/components/stock/StockForm';
import { Skeleton } from '@/components/ui/skeleton';

const EditStock = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadStockItem = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError('');
      
      try {
        const data = await fetchStockItemById(id);
        if (!data) {
          setError('Item not found');
          return;
        }
        setItem(data);
      } catch (err) {
        console.error('Error loading stock item:', err);
        setError('Failed to load item details');
      } finally {
        setIsLoading(false);
      }
    };

    loadStockItem();
  }, [id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-32" />
        <div className="mt-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold mb-2">Error</h2>
        <p className="text-muted-foreground">{error}</p>
        <button 
          className="mt-4 text-primary hover:underline"
          onClick={() => navigate('/stock')}
        >
          Return to Inventory
        </button>
      </div>
    );
  }

  if (!item) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Inventory Item</h1>
        <p className="text-muted-foreground">
          Update information for this inventory item
        </p>
      </div>

      <StockForm initialData={item} isEditing={true} />
    </div>
  );
};

export default EditStock;
