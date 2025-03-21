
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StockItem } from '@/types';
import { Grid, List, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StockList from '@/components/stock/StockList';
import { fetchStockItems } from '@/services/stockService';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const Stock = () => {
  const [items, setItems] = useState<StockItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card');

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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground text-sm">
            Manage and track IT department inventory and equipment.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as 'card' | 'list')}>
            <ToggleGroupItem value="card" aria-label="Card view">
              <Grid size={16} />
            </ToggleGroupItem>
            <ToggleGroupItem value="list" aria-label="List view">
              <List size={16} />
            </ToggleGroupItem>
          </ToggleGroup>
          <Button asChild>
            <Link to="/stock/new">
              <Plus size={16} className="mr-2" />
              Add Item
            </Link>
          </Button>
        </div>
      </div>

      <StockList items={items} isLoading={isLoading} viewMode={viewMode} />
    </div>
  );
};

export default Stock;
