import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { PATHS } from "@/constants/paths";

export default function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 p-4 rounded-full">
            <Lock className="h-12 w-12 text-red-500" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          401 - Không có quyền truy cập
        </h1>

        {/* Subtitle */}
        <p className="text-gray-600 mb-6">
          Xin lỗi, bạn không có quyền để xem trang này. Vui lòng kiểm tra tài
          khoản hoặc quay lại trang chủ.
        </p>

        {/* Button */}
        <button
          onClick={() => navigate(PATHS.HOME)}
          className="px-6 py-2 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors shadow-md"
        >
          Quay lại Trang chủ
        </button>
      </div>
    </div>
  );
}
