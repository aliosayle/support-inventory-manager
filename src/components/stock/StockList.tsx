
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { StockItem } from '@/types';
import { Edit, Eye, Filter, MoreHorizontal, Package, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StockListProps {
  items: StockItem[];
}

const StockList = ({ items }: StockListProps) => {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredItems = items.filter(item => {
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const categories = Array.from(new Set(items.map(item => item.category)));
  
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
      month: 'short', 
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Input
            placeholder="Search stock items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Button variant="outline" size="icon">
            <Filter size={16} />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="in-use">In Use</SelectItem>
              <SelectItem value="repair">Repair</SelectItem>
              <SelectItem value="disposed">Disposed</SelectItem>
            </SelectContent>
          </Select>
          <Button asChild>
            <Link to="/stock/new">
              <Plus size={16} className="mr-2" />
              Add Item
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredItems.length === 0 ? (
          <div className="col-span-full text-center py-6 text-muted-foreground">
            No stock items found
          </div>
        ) : (
          filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden transition-all hover:shadow-md animate-zoom-in">
              <div className="aspect-square bg-muted relative">
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
                <Badge 
                  variant="outline" 
                  className={cn("capitalize absolute top-2 right-2", getStatusColor(item.status))}
                >
                  {item.status}
                </Badge>
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold line-clamp-1">{item.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {item.category}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="-mr-2">
                        <MoreHorizontal size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/stock/${item.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to={`/stock/${item.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-4 text-sm">
                  <div className="text-muted-foreground">Quantity:</div>
                  <div className="text-right font-medium">{item.quantity}</div>
                  
                  <div className="text-muted-foreground">Model:</div>
                  <div className="text-right font-medium line-clamp-1">{item.model || 'N/A'}</div>
                  
                  <div className="text-muted-foreground">Price:</div>
                  <div className="text-right font-medium">{formatCurrency(item.price)}</div>
                  
                  <div className="text-muted-foreground">Purchased:</div>
                  <div className="text-right font-medium">{formatDate(item.purchaseDate)}</div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default StockList;
