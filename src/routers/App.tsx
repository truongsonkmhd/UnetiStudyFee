import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";

import { AppLayout } from "@/components/layout/AppLayout";
import NotFound from "../views/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />

      <Routes>
        {/* trang public */}
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="/auth" element={<AppLayout />} />

        {/* các trang sau đăng nhập dùng layout chung */}
        <Route element={<AppLayout />}>
          <Route path="/home" element={<div>Trang chủ (Sắp Ra Mắt)</div>} />
          <Route path="/articles" element={<div>Bài viết (Sắp Ra Mắt)</div>} />
          <Route path="/ranking" element={<div>Xếp hạng (Sắp Ra Mắt)</div>} />
          <Route path="/createLession" element={<div>Tạo bài giảng (Sắp Ra Mắt)</div>} />
          <Route path="/createTest" element={<div>Tạo bài thi (Sắp Ra Mắt)</div>} />
          <Route path="/tests" element={<div>Bài thi (Sắp Ra Mắt)</div>} />
          <Route path="/managerPersons" element={<div>Quản lý ... (Sắp Ra Mắt)</div>} />
          <Route path="/managerinterest" element={<div>Quản lý quyền (Sắp Ra Mắt)</div>} />
          <Route path="/classattended" element={<div>Lớp đã tham gia (Sắp Ra Mắt)</div>} />
          <Route path="/posthistory" element={<div>Lịch sử bài (Sắp Ra Mắt)</div>} />
          <Route path="/tutorial" element={<div>Hướng dẫn (Sắp Ra Mắt)</div>} />
          <Route path="/settings" element={<div> Cài Đặt (Sắp Ra Mắt)</div>} />
        </Route>

        {/* catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
