
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StockItem } from '@/types';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StockList from '@/components/stock/StockList';
import { fetchStockItems } from '@/services/stockService';

const Stock = () => {
  const [items, setItems] = useState<StockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStockItems = async () => {
      setIsLoading(true);
      try {
        const data = await fetchStockItems();
        setItems(data);
      } finally {
        setIsLoading(false);
      }
    };

    loadStockItems();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground">
            Manage and track IT department inventory and equipment.
          </p>
        </div>
        <Button asChild>
          <Link to="/stock/new">
            <Plus size={16} className="mr-2" />
            Add Item
          </Link>
        </Button>
      </div>

      <StockList items={items} isLoading={isLoading} />
    </div>
  );
};

export default Stock;
