
import { useState } from 'react';
import { StockItem } from '@/types';
import { Button } from '@/components/ui/button';
import { StockTransactionDialog } from './StockTransactionDialog';
import { StockUsageHistory } from './StockUsageHistory';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface StockTransactionsPanelProps {
  stockItem: StockItem;
  onStockUpdated: () => void;
}

export function StockTransactionsPanel({ 
  stockItem, 
  onStockUpdated 
}: StockTransactionsPanelProps) {
  const { hasPermission } = useAuth();
  const [isStockInOpen, setIsStockInOpen] = useState(false);
  const [isStockOutOpen, setIsStockOutOpen] = useState(false);
  
  const canManageTransactions = hasPermission('manage_stock_transactions');

  const handleTransactionSuccess = () => {
    setIsStockInOpen(false);
    setIsStockOutOpen(false);
    onStockUpdated();
  };

  return (
    <div className="space-y-6">
      {canManageTransactions && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            className="flex-1"
            onClick={() => setIsStockInOpen(true)}
          >
            <ArrowDown size={16} className="mr-2" />
            Stock In
          </Button>
          <Button 
            className="flex-1"
            variant="secondary"
            onClick={() => setIsStockOutOpen(true)}
            disabled={stockItem.quantity <= 0}
          >
            <ArrowUp size={16} className="mr-2" />
            Stock Out
          </Button>
        </div>
      )}

      <StockUsageHistory stockItemId={stockItem.id} />

      {canManageTransactions && (
        <>
          <StockTransactionDialog
            stockItem={stockItem}
            transactionType="in"
            isOpen={isStockInOpen}
            onClose={() => setIsStockInOpen(false)}
            onSuccess={handleTransactionSuccess}
          />

          <StockTransactionDialog
            stockItem={stockItem}
            transactionType="out"
            isOpen={isStockOutOpen}
            onClose={() => setIsStockOutOpen(false)}
            onSuccess={handleTransactionSuccess}
          />
        </>
      )}
    </div>
  );
}
