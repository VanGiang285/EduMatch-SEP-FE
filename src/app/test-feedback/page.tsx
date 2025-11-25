'use client';
import React, { useState } from 'react';
import { CreateFeedbackDialog } from '@/components/feedback/CreateFeedbackDialog';
import { Button } from '@/components/ui/basic/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';

export default function TestFeedbackPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [tutorId, setTutorId] = useState(1);
  const [bookingId, setBookingId] = useState(1);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="border-[#FD8B51]">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Test Feedback Dialog</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tutor ID
                </label>
                <input
                  type="number"
                  value={tutorId}
                  onChange={(e) => setTutorId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FD8B51]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Booking ID
                </label>
                <input
                  type="number"
                  value={bookingId}
                  onChange={(e) => setBookingId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FD8B51]"
                />
              </div>
            </div>

            <Button
              onClick={() => setDialogOpen(true)}
              className="bg-[#FD8B51] text-white hover:bg-[#CB6040]"
            >
              Mở Dialog Tạo Đánh giá
            </Button>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Hướng dẫn:</strong> Nhập Tutor ID và Booking ID, sau đó nhấn nút để mở dialog tạo đánh giá.
              </p>
            </div>
          </CardContent>
        </Card>

        <CreateFeedbackDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          tutorId={tutorId}
          bookingId={bookingId}
          onSuccess={() => {
            console.log('Feedback created successfully!');
          }}
        />
      </div>
    </div>
  );
}

