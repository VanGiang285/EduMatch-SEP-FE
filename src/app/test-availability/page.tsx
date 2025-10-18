"use client";

import { useState, useEffect } from 'react';
import { MasterDataService, TimeSlotDto } from '@/services/masterDataService';
import { TutorManagementService, LegacyBecomeTutorRequest } from '@/services/tutorManagementService';

export default function TestAvailabilityPage() {
  const [timeSlots, setTimeSlots] = useState<TimeSlotDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [testData, setTestData] = useState<LegacyBecomeTutorRequest | null>(null);
  const [convertedData, setConvertedData] = useState<any>(null);

  useEffect(() => {
    loadTimeSlots();
  }, []);

  const loadTimeSlots = async () => {
    try {
      setLoading(true);
      const response = await MasterDataService.getAllTimeSlots();
      if (response.success && response.data) {
        setTimeSlots(response.data);
        console.log('✅ Time slots loaded:', response.data);
      } else {
        setError('Failed to load time slots');
      }
    } catch (err) {
      console.error('❌ Error loading time slots:', err);
      setError('Error loading time slots');
    } finally {
      setLoading(false);
    }
  };

  const generateTestData = () => {
    const testData: LegacyBecomeTutorRequest = {
      fullName: 'Nguyễn Văn A',
      email: 'test@example.com',
      province: '01',
      district: '001',
      subjects: [{ subjectId: 1, levelId: 1, hourlyRate: '100000' }],
      birthDate: '1990-01-01',
      phone: '0123456789',
      teachingMode: 2,
      introduction: 'Test introduction',
      teachingExperience: 'Test experience',
      attractiveTitle: 'Test title',
      hourlyRate: '100000',
      schedule: {
        monday: [9, 10], // Monday: 09:00-10:00, 10:00-11:00
        wednesday: [15, 16], // Wednesday: 15:00-16:00, 16:00-17:00
        friday: [9, 15, 16], // Friday: 09:00-10:00, 15:00-16:00, 16:00-17:00
      }
    };

    setTestData(testData);
    console.log('🧪 Test data generated:', testData);

    // Test conversion
    try {
      const converted = TutorManagementService.becomeTutor(testData);
      setConvertedData(converted);
      console.log('🔄 Converted data:', converted);
    } catch (err) {
      console.error('❌ Conversion error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading time slots...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={loadTimeSlots}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            🧪 Availability System Test
          </h1>

          {/* Time Slots Display */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              📅 Time Slots from Backend ({timeSlots.length} slots)
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4">
              {timeSlots.map((slot) => (
                <div key={slot.id} className="p-2 bg-gray-50 rounded text-sm">
                  <div className="font-medium">ID: {slot.id}</div>
                  <div>{slot.startTime} - {slot.endTime}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Test Data Generation */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              🧪 Test Data Generation
            </h2>
            <button
              onClick={generateTestData}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Generate Test Data
            </button>
          </div>

          {/* Test Data Display */}
          {testData && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                📋 Test Data
              </h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm overflow-x-auto">
                  {JSON.stringify(testData, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Converted Data Display */}
          {convertedData && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                🔄 Converted Data (Backend Format)
              </h2>
              <div className="bg-blue-50 p-4 rounded-lg">
                <pre className="text-sm overflow-x-auto">
                  {JSON.stringify(convertedData, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Expected vs Actual */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              ✅ Expected vs Actual
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Expected Structure:</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• availabilities: TutorAvailabilityCreateRequest[]</li>
                  <li>• Each item: {`{tutorId, slotId, startDate}`}</li>
                  <li>• slotId: Real ID from time_slots table</li>
                  <li>• startDate: Specific date + time</li>
                  <li>• Multiple records for date range</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Test Scenario:</h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Monday: slots 9, 10</li>
                  <li>• Wednesday: slots 15, 16</li>
                  <li>• Friday: slots 9, 15, 16</li>
                  <li>• Expected: 7 availability records</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2">📝 How to Test:</h3>
            <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
              <li>Click "Generate Test Data" to create sample data</li>
              <li>Check the converted data structure</li>
              <li>Verify slotId matches time_slots table IDs</li>
              <li>Verify startDate includes specific dates</li>
              <li>Count total availability records</li>
              <li>Test with real become-tutor form</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
