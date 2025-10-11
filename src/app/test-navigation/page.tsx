import { PageWrapper } from '@/components/common/PageWrapper';

export default function TestNavigation() {
  return (
    <PageWrapper currentPage="test">
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Test Navigation - EduMatch
          </h1>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Các trang đã được tạo:</h2>
            <ul className="space-y-3">
              <li>
                <strong>Tìm gia sư:</strong> 
                <span className="text-gray-600 ml-2">/find-tutor</span>
              </li>
              <li>
                <strong>Chi tiết gia sư:</strong> 
                <span className="text-gray-600 ml-2">/tutor/[id] (ví dụ: /tutor/1)</span>
              </li>
              <li>
                <strong>Gia sư đã lưu:</strong> 
                <span className="text-gray-600 ml-2">/saved-tutors</span>
              </li>
            </ul>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800">
                <strong>Hướng dẫn:</strong> Sử dụng navbar ở trên để điều hướng giữa các trang. 
                Tất cả các trang đều có navbar với link "Tìm gia sư" hoạt động.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
