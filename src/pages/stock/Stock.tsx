
import { stockItems } from '@/utils/mockData';
import StockList from '@/components/stock/StockList';

const Stock = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
        <p className="text-muted-foreground">
          Manage and track IT department inventory and equipment.
        </p>
      </div>

      <StockList items={stockItems} />
    </div>
  );
};

export default Stock;
