import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";

import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "../views/pages/Dashboard";
import Projects from "../views/pages/Projects";
import Tasks from "../views/pages/Tasks";
import NotFound from "../views/pages/NotFound";
import AuthScreen from "@/views/login-and-registor/AuthScreen";
import Disbursement from "@/views/pages/Disbursement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <Routes>
        {/* trang public */}
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="/auth" element={<AuthScreen />} />

        {/* các trang sau đăng nhập dùng layout chung */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/tasks" element={<Tasks />} />        
          <Route path="/timeline" element={<div>Trang Tiến Độ (Sắp Ra Mắt)</div>} />
          <Route path="/disbursement" element={<Disbursement/>} />
          <Route path="/documents" element={<div>Trang Tài Liệu (Sắp Ra Mắt)</div>} />
          <Route path="/team" element={<div>Trang Nhóm (Sắp Ra Mắt)</div>} />
          <Route path="/discussions" element={<div>Trang Thảo Luận (Sắp Ra Mắt)</div>} />
          <Route path="/templates" element={<div>Trang Mẫu (Sắp Ra Mắt)</div>} />
          <Route path="/reports" element={<div>Trang Báo Cáo (Sắp Ra Mắt)</div>} />
          <Route path="/tools" element={<div>Trang Công Cụ (Sắp Ra Mắt)</div>} />
          <Route path="/settings" element={<div>Trang Cài Đặt (Sắp Ra Mắt)</div>} />
        </Route>

        {/* catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
