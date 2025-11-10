/**
 * Helper functions để test API integration
 * Sử dụng trong console hoặc component để kiểm tra API
 */

import { FindTutorService } from '@/services/findTutorService';
import { SubjectService } from '@/services/subjectService';
import { CertificateService } from '@/services/certificateService';
import { TutorFilterDto } from '@/types/backend';
import { TeachingMode } from '@/types/enums';

export const TestAPI = {
  // Test lấy tất cả gia sư
  async testGetAllTutors() {
    console.log('🧪 Testing getAllTutors...');
    const response = await FindTutorService.getAllTutors();
    console.log('✅ Response:', response);
    console.log('📊 Total tutors:', response.data?.length || 0);
    return response;
  },

  // Test tìm kiếm gia sư
  async testSearchTutors() {
    console.log('🧪 Testing searchTutors...');
    const filter: TutorFilterDto = {
      keyword: 'toán',
      page: 1,
      pageSize: 10
    };
    const response = await FindTutorService.searchTutors(filter);
    console.log('✅ Response:', response);
    console.log('📊 Found tutors:', response.data?.length || 0);
    return response;
  },

  // Test lấy môn học
  async testGetSubjects() {
    console.log('🧪 Testing getAllSubjects...');
    const response = await SubjectService.getAllSubjects();
    console.log('✅ Response:', response);
    console.log('📊 Total subjects:', response.data?.length || 0);
    return response;
  },

  // Test lấy levels
  async testGetLevels() {
    console.log('🧪 Testing getAllLevels...');
    const response = await CertificateService.getAllLevels();
    console.log('✅ Response:', response);
    console.log('📊 Total levels:', response.data?.length || 0);
    return response;
  },

  // Test lấy certificate types
  async testGetCertificateTypes() {
    console.log('🧪 Testing getAllCertificateTypes...');
    const response = await CertificateService.getAllCertificateTypes();
    console.log('✅ Response:', response);
    console.log('📊 Total certificate types:', response.data?.length || 0);
    return response;
  },

  // Chạy tất cả tests
  async runAllTests() {
    console.log('🚀 Running all API integration tests...\n');
    
    try {
      await this.testGetAllTutors();
      console.log('\n');
      
      await this.testSearchTutors();
      console.log('\n');
      
      await this.testGetSubjects();
      console.log('\n');
      
      await this.testGetLevels();
      console.log('\n');
      
      await this.testGetCertificateTypes();
      console.log('\n');
      
      console.log('✅ All tests completed!');
    } catch (error) {
      console.error('❌ Test failed:', error);
    }
  }
};

// Export để sử dụng trong browser console
if (typeof window !== 'undefined') {
  (window as any).TestAPI = TestAPI;
}


