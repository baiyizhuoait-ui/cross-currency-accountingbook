import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "@/contexts/AppContext";
import Layout from "@/components/Layout";
import TransactionHall from "@/pages/TransactionHall";
import MyAssets from "@/pages/MyAssets";
import ExpenseCalendar from "@/pages/ExpenseCalendar";
import DataDashboard from "@/pages/DataDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/transactions" replace />} />
              <Route path="/transactions" element={<TransactionHall />} />
              <Route path="/assets" element={<MyAssets />} />
              <Route path="/calendar" element={<ExpenseCalendar />} />
              <Route path="/dashboard" element={<DataDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </AppProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
