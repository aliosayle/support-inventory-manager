
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchStockItemById } from '@/services/stockService';
import StockDetailComponent from '@/components/stock/StockDetail';
import { Skeleton } from '@/components/ui/skeleton';

const StockDetailPage = () => {
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
        <div className="flex flex-col md:flex-row gap-6">
          <Skeleton className="md:w-1/3 aspect-square" />
          <div className="md:w-2/3 space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-3/4" />
          </div>
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

  return <StockDetailComponent item={item} />;
};

export default StockDetailPage;
