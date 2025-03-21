
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { StockItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Package, Edit, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import { deleteStockItem } from "@/services/stockService";
import { cn } from "@/lib/utils";

interface StockDetailProps {
  item: StockItem;
}

const StockDetail = ({ item }: StockDetailProps) => {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'in-use': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'repair': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'disposed': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      default: return '';
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  };

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const success = await deleteStockItem(item.id);
    if (success) {
      navigate('/stock');
    }
    setIsDeleting(false);
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <CardTitle className="text-2xl">{item.name}</CardTitle>
          <div className="flex items-center gap-2 mt-2">
            <Badge>{item.category}</Badge>
            <Badge className={cn("capitalize", getStatusColor(item.status))}>
              {item.status}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/stock/${item.id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete this item
                  from your inventory.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>Delete</>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3 aspect-square bg-muted rounded-md relative overflow-hidden">
            {item.image ? (
              <img
                src={item.image}
                alt={item.name}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full">
                <Package size={64} className="text-muted-foreground/40" />
              </div>
            )}
          </div>
          <div className="md:w-2/3">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <div className="text-muted-foreground">Description:</div>
              <div>{item.description || 'N/A'}</div>
              
              <div className="text-muted-foreground">Quantity:</div>
              <div className="font-medium">{item.quantity}</div>
              
              <div className="text-muted-foreground">Manufacturer:</div>
              <div>{item.manufacturer || 'N/A'}</div>
              
              <div className="text-muted-foreground">Model:</div>
              <div>{item.model || 'N/A'}</div>
              
              <div className="text-muted-foreground">Serial Number:</div>
              <div>{item.serialNumber || 'N/A'}</div>
              
              <div className="text-muted-foreground">Purchase Date:</div>
              <div>{formatDate(item.purchaseDate)}</div>
              
              <div className="text-muted-foreground">Price:</div>
              <div>{formatCurrency(item.price)}</div>
              
              <div className="text-muted-foreground">Location:</div>
              <div>{item.location || 'N/A'}</div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          onClick={() => navigate('/stock')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Inventory
        </Button>
      </CardFooter>
    </Card>
  );
};

export default StockDetail;
