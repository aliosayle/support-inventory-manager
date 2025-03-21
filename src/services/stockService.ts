
import { supabase } from "@/integrations/supabase/client";
import { StockItem } from "@/types";
import { mapDbStockItemToStockItem, mapDbStockItems } from "@/utils/dataMapping";
import { toast } from "sonner";

// Fetch all stock items
export async function fetchStockItems() {
  try {
    const { data, error } = await supabase
      .from('stock_items')
      .select('*')
      .order('name');
    
    if (error) throw error;
    
    return mapDbStockItems(data || []);
  } catch (error: any) {
    console.error('Error fetching stock items:', error);
    toast.error('Failed to load inventory items');
    return [];
  }
}

// Fetch a single stock item by id
export async function fetchStockItemById(id: string) {
  try {
    const { data, error } = await supabase
      .from('stock_items')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    if (!data) return null;
    
    return mapDbStockItemToStockItem(data);
  } catch (error: any) {
    console.error('Error fetching stock item:', error);
    toast.error('Failed to load item details');
    return null;
  }
}

// Create a new stock item
export async function createStockItem(stockItem: Omit<StockItem, 'id'>) {
  try {
    // Convert frontend model to database model (camelCase to snake_case)
    const dbStockItem = {
      name: stockItem.name,
      category: stockItem.category,
      description: stockItem.description,
      quantity: stockItem.quantity,
      manufacturer: stockItem.manufacturer,
      model: stockItem.model,
      serial_number: stockItem.serialNumber,
      purchase_date: stockItem.purchaseDate,
      price: stockItem.price,
      location: stockItem.location,
      status: stockItem.status,
      image: stockItem.image
    };
    
    const { data, error } = await supabase
      .from('stock_items')
      .insert(dbStockItem)
      .select('*')
      .single();
    
    if (error) throw error;
    
    toast.success('Item added successfully');
    return mapDbStockItemToStockItem(data);
  } catch (error: any) {
    console.error('Error creating stock item:', error);
    toast.error('Failed to add new item');
    return null;
  }
}

// Update an existing stock item
export async function updateStockItem(id: string, stockItem: Partial<StockItem>) {
  try {
    // Convert frontend model to database model (camelCase to snake_case)
    const dbStockItem: Record<string, any> = {};
    
    if (stockItem.name !== undefined) dbStockItem.name = stockItem.name;
    if (stockItem.category !== undefined) dbStockItem.category = stockItem.category;
    if (stockItem.description !== undefined) dbStockItem.description = stockItem.description;
    if (stockItem.quantity !== undefined) dbStockItem.quantity = stockItem.quantity;
    if (stockItem.manufacturer !== undefined) dbStockItem.manufacturer = stockItem.manufacturer;
    if (stockItem.model !== undefined) dbStockItem.model = stockItem.model;
    if (stockItem.serialNumber !== undefined) dbStockItem.serial_number = stockItem.serialNumber;
    if (stockItem.purchaseDate !== undefined) dbStockItem.purchase_date = stockItem.purchaseDate;
    if (stockItem.price !== undefined) dbStockItem.price = stockItem.price;
    if (stockItem.location !== undefined) dbStockItem.location = stockItem.location;
    if (stockItem.status !== undefined) dbStockItem.status = stockItem.status;
    if (stockItem.image !== undefined) dbStockItem.image = stockItem.image;
    
    const { data, error } = await supabase
      .from('stock_items')
      .update(dbStockItem)
      .eq('id', id)
      .select('*')
      .single();
    
    if (error) throw error;
    
    toast.success('Item updated successfully');
    return mapDbStockItemToStockItem(data);
  } catch (error: any) {
    console.error('Error updating stock item:', error);
    toast.error('Failed to update item');
    return null;
  }
}

// Delete a stock item
export async function deleteStockItem(id: string) {
  try {
    const { error } = await supabase
      .from('stock_items')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    toast.success('Item deleted successfully');
    return true;
  } catch (error: any) {
    console.error('Error deleting stock item:', error);
    toast.error('Failed to delete item');
    return false;
  }
}
