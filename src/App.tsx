import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import Index from "./pages/Index";
import Dashboard from "./pages/dashboard/Dashboard";
import Issues from "./pages/issues/Issues";
import NewIssue from "./pages/issues/NewIssue";
import Stock from "./pages/stock/Stock";
import StockDetail from "./pages/stock/StockDetail";
import NewStock from "./pages/stock/NewStock";
import EditStock from "./pages/stock/EditStock";
import Users from "./pages/users/Users";
import NewUser from "./pages/users/NewUser";
import Reports from "./pages/reports/Reports";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/issues" element={<Issues />} />
              <Route path="/issues/new" element={<NewIssue />} />
              <Route path="/stock" element={<Stock />} />
              <Route path="/stock/:id" element={<StockDetail />} />
              <Route path="/stock/new" element={<NewStock />} />
              <Route path="/stock/:id/edit" element={<EditStock />} />
              <Route path="/users" element={<Users />} />
              <Route path="/users/new" element={<NewUser />} />
              <Route path="/reports" element={<Reports />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
