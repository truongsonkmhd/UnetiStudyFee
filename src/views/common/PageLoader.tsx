export default function PageLoader() {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>

        <p className="text-gray-600 font-medium text-lg animate-pulse">
          Đang tải trang...
        </p>
      </div>
    </div>
  );
}
