import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Cell,
  LabelList,
  LineChart,
  Line
} from 'recharts';
import { ArrowDownToLine, ArrowUpFromLine, Filter, CalendarRange } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRange } from "react-day-picker";
import { addDays, format, subDays } from "date-fns";
import { DateRangePicker } from "@/components/dashboard/date-range-picker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface StockTransaction {
  date: Date;
  id: string;
  stockItemId: string;
  stockItemName: string;
  category: string;
  quantity: number;
  transactionType: 'in' | 'out';
  assignedToName?: string;
}

interface TransactionsByDateData {
  date: string;
  in: number;
  out: number;
}

interface TransactionsByCategoryData {
  category: string;
  in: number;
  out: number;
}

type TimeRange = '7days' | '30days' | '90days' | 'custom';

export function StockTransactionsReport() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30days');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  
  const { data: transactions = [], isLoading } = useQuery<StockTransaction[]>({
    queryKey: ['stockTransactions', dateRange],
    queryFn: async () => {
      try {
        const from = dateRange?.from ? dateRange.from.toISOString() : subDays(new Date(), 30).toISOString();
        const to = dateRange?.to ? dateRange.to.toISOString() : new Date().toISOString();
        
        const { data, error } = await supabase
          .from('stock_usage')
          .select(`
            id,
            quantity,
            date,
            transaction_type,
            notes,
            stock_item_id,
            stock_items(name, category),
            user:assigned_to(name)
          `)
          .gte('date', from)
          .lte('date', to)
          .order('date', { ascending: false });
        
        if (error) throw error;
        
        return (data || []).map(item => ({
          id: item.id,
          date: new Date(item.date),
          stockItemId: item.stock_item_id,
          stockItemName: item.stock_items?.name || 'Unknown Item',
          category: item.stock_items?.category || 'Uncategorized',
          quantity: item.quantity,
          transactionType: item.transaction_type as 'in' | 'out',
          assignedToName: item.user?.name
        }));
      } catch (error) {
        console.error('Error fetching stock transactions:', error);
        return [];
      }
    },
    staleTime: 300000, // 5 minutes
  });
  
  const transactionsByDate = transactions.reduce((acc: Record<string, TransactionsByDateData>, transaction) => {
    const dateStr = format(transaction.date, 'MMM dd');
    
    if (!acc[dateStr]) {
      acc[dateStr] = { date: dateStr, in: 0, out: 0 };
    }
    
    if (transaction.transactionType === 'in') {
      acc[dateStr].in += transaction.quantity;
    } else {
      acc[dateStr].out += transaction.quantity;
    }
    
    return acc;
  }, {});
  
  const transactionsByDateData = Object.values(transactionsByDate).sort((a, b) => {
    const dateA = new Date(a.date.replace(/^(\w{3}) (\d{2})$/, `$1 $2 ${new Date().getFullYear()}`));
    const dateB = new Date(b.date.replace(/^(\w{3}) (\d{2})$/, `$1 $2 ${new Date().getFullYear()}`));
    return dateA.getTime() - dateB.getTime();
  });
  
  const transactionsByCategory = transactions.reduce((acc: Record<string, TransactionsByCategoryData>, transaction) => {
    const category = transaction.category;
    
    if (!acc[category]) {
      acc[category] = { category, in: 0, out: 0 };
    }
    
    if (transaction.transactionType === 'in') {
      acc[category].in += transaction.quantity;
    } else {
      acc[category].out += transaction.quantity;
    }
    
    return acc;
  }, {});
  
  const transactionsByCategoryData = Object.values(transactionsByCategory);
  
  const totalIn = transactions.filter(t => t.transactionType === 'in')
    .reduce((sum, t) => sum + t.quantity, 0);
  
  const totalOut = transactions.filter(t => t.transactionType === 'out')
    .reduce((sum, t) => sum + t.quantity, 0);

  const handleTimeRangeChange = (value: string) => {
    const newTimeRange = value as TimeRange;
    setTimeRange(newTimeRange);
    
    if (newTimeRange === '7days') {
      setDateRange({
        from: subDays(new Date(), 7),
        to: new Date(),
      });
    } else if (newTimeRange === '30days') {
      setDateRange({
        from: subDays(new Date(), 30),
        to: new Date(),
      });
    } else if (newTimeRange === '90days') {
      setDateRange({
        from: subDays(new Date(), 90),
        to: new Date(),
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Inventory Transactions</h2>
          <p className="text-muted-foreground">Track inventory stock movements over time</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-[180px]">
              <CalendarRange className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
          
          {timeRange === 'custom' && (
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
            />
          )}
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Items In</CardTitle>
            <CardDescription>Items added to inventory</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="flex items-center">
                <ArrowDownToLine className="h-5 w-5 mr-2 text-green-500" />
                <div className="text-3xl font-bold">{totalIn}</div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Items Out</CardTitle>
            <CardDescription>Items removed from inventory</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="flex items-center">
                <ArrowUpFromLine className="h-5 w-5 mr-2 text-amber-500" />
                <div className="text-3xl font-bold">{totalOut}</div>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Net Inventory Change</CardTitle>
            <CardDescription>Total items added minus removed</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="flex items-center">
                <div className={cn(
                  "h-5 w-5 mr-2 rounded-full flex items-center justify-center",
                  totalIn - totalOut > 0 ? "bg-green-100 text-green-500" : "bg-amber-100 text-amber-500"
                )}>
                  {totalIn - totalOut > 0 ? "+" : "-"}
                </div>
                <div className="text-3xl font-bold">{Math.abs(totalIn - totalOut)}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Transactions by Date</CardTitle>
            <CardDescription>Daily inventory movements</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              </div>
            ) : transactionsByDateData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={transactionsByDateData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border border-border p-2 rounded shadow-sm">
                            <p className="font-medium">{label}</p>
                            <p className="text-xs text-green-500">In: {payload[0].value} items</p>
                            <p className="text-xs text-amber-500">Out: {payload[1].value} items</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="in" stroke="#22c55e" name="Items In" />
                  <Line type="monotone" dataKey="out" stroke="#f59e0b" name="Items Out" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-full text-muted-foreground">
                No transaction data available for the selected period
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Transactions by Category</CardTitle>
            <CardDescription>Inventory movement by item category</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            {isLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              </div>
            ) : transactionsByCategoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={transactionsByCategoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border border-border p-2 rounded shadow-sm">
                            <p className="font-medium">{label}</p>
                            <p className="text-xs text-green-500">In: {payload[0].value} items</p>
                            <p className="text-xs text-amber-500">Out: {payload[1].value} items</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend />
                  <Bar dataKey="in" fill="#22c55e" name="Items In" />
                  <Bar dataKey="out" fill="#f59e0b" name="Items Out" />
                </RechartsBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-full text-muted-foreground">
                No category data available for the selected period
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Detailed history of all inventory transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : transactions.length > 0 ? (
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Item</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Assigned To</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(transaction.date, 'MMM dd, yyyy h:mm a')}
                      </TableCell>
                      <TableCell>{transaction.stockItemName}</TableCell>
                      <TableCell>{transaction.category}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            transaction.transactionType === 'in'
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                          )}
                        >
                          {transaction.transactionType === 'in' ? (
                            <><ArrowDownToLine size={14} className="mr-1" /> In</>
                          ) : (
                            <><ArrowUpFromLine size={14} className="mr-1" /> Out</>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>{transaction.quantity}</TableCell>
                      <TableCell>
                        {transaction.transactionType === 'out' ? transaction.assignedToName || 'N/A' : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No transaction history found for the selected time period
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
