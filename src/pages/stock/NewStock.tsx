
import StockForm from '@/components/stock/StockForm';

const NewStock = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add Inventory Item</h1>
        <p className="text-muted-foreground">
          Add a new item to your inventory
        </p>
      </div>

      <StockForm />
    </div>
  );
};

export default NewStock;
