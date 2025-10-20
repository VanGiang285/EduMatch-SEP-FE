"use client";

export default function SystemAdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow border border-[#FD8B51] p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          System Admin Dashboard
        </h2>
        <p className="text-gray-600">
          Đây là trang dashboard dành cho System Admin. Chỉ có System Admin (roleId: 4) mới có thể truy cập vào đây.
        </p>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#F2E5BF] border border-[#FD8B51] p-4 rounded-lg">
            <h3 className="font-medium text-[#257180]">Tổng số người dùng</h3>
            <p className="text-2xl font-bold text-[#257180]">1,234</p>
          </div>
          <div className="bg-[#F2E5BF] border border-[#FD8B51] p-4 rounded-lg">
            <h3 className="font-medium text-[#257180]">Tổng số gia sư</h3>
            <p className="text-2xl font-bold text-[#257180]">567</p>
          </div>
          <div className="bg-[#F2E5BF] border border-[#FD8B51] p-4 rounded-lg">
            <h3 className="font-medium text-[#257180]">Đang chờ duyệt</h3>
            <p className="text-2xl font-bold text-[#257180]">23</p>
          </div>
          <div className="bg-[#F2E5BF] border border-[#FD8B51] p-4 rounded-lg">
            <h3 className="font-medium text-[#257180]">Tổng doanh thu</h3>
            <p className="text-2xl font-bold text-[#257180]">₫12.5M</p>
          </div>
        </div>
      </div>
    </div>
  );
}

