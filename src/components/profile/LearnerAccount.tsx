"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/basic/button';
import { User, Calendar, BookOpen, Wallet, MessageCircle, Settings, GraduationCap, FileText, Bell } from 'lucide-react';
import { ProfileTab } from './tabs/ProfileTab';
import { ScheduleTab } from './tabs/ScheduleTab';
import { TutorScheduleTab } from './tabs/TutorScheduleTab';
import { ClassesTab } from './tabs/ClassesTab';
import { TutorBookingsTab } from './tabs/TutorBookingsTab';
import { WalletTab } from './tabs/WalletTab';
import { MessagesTab } from './tabs/MessagesTab';
import { SettingsTab } from './tabs/SettingsTab';
import { TutorProfileTab } from './tabs/TutorProfileTab';
import { ClassRequestsTab } from './tabs/ClassRequestsTab';
import { NotificationsTab } from './tabs/NotificationsTab';
import { Badge } from '@/components/ui/basic/badge';
import { mockNotifications } from '@/data/mockLearnerData';
import { useAuth } from '@/hooks/useAuth';
import { USER_ROLES } from '@/constants';

interface LearnerAccountProps {
  initialTab?: string;
}

export function LearnerAccount({ initialTab = 'profile' }: LearnerAccountProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync activeTab with initialTab when it changes (e.g., from URL query)
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Redirect to profile if user tries to access tutorProfile but is not a tutor
  useEffect(() => {
    if (activeTab === 'tutorProfile' && user && user.role !== USER_ROLES.TUTOR) {
      setActiveTab('profile');
    }
  }, [activeTab, user]);

  const unreadNotifications = mockNotifications.filter(n => !n.isRead).length;

  // Check if user is a tutor
  const isTutor = user && user.role === USER_ROLES.TUTOR;

  const menuItems = [
    { id: 'profile', label: 'Thông tin người dùng', icon: User },
    ...(isTutor ? [{ id: 'tutorProfile', label: 'Hồ sơ gia sư', icon: GraduationCap }] : []),
    { id: 'schedule', label: isTutor ? 'Lịch dạy' : 'Lịch học', icon: Calendar },
    { id: 'classes', label: isTutor ? 'Lịch đặt' : 'Lớp học', icon: BookOpen },
    { id: 'classRequests', label: 'Yêu cầu mở lớp', icon: FileText },
    { id: 'wallet', label: 'Ví', icon: Wallet },
    { id: 'notifications', label: 'Thông báo', icon: Bell, badge: unreadNotifications },
    { id: 'messages', label: 'Tin nhắn', icon: MessageCircle },
    { id: 'settings', label: 'Cài đặt', icon: Settings }

  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileTab />;
      case 'tutorProfile':
        return <TutorProfileTab />;
      case 'schedule':
        return isTutor ? <TutorScheduleTab /> : <ScheduleTab />;
      case 'classes':
        return isTutor ? <TutorBookingsTab /> : <ClassesTab />;
      case 'classRequests':
        return <ClassRequestsTab />;
      case 'wallet':
        return <WalletTab />;
      case 'notifications':
        return <NotificationsTab />;
      case 'messages':
        return <MessagesTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <ProfileTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden sticky top-24">
              <div className="p-4 border-b bg-gray-50">
                <h3 className="font-semibold">Tài khoản của tôi</h3>
              </div>
              <nav className="p-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <Button
                      key={item.id}
                      variant="ghost"
                      className={`w-full justify-start mb-1 ${isActive
                        ? 'bg-[#257180]/10 text-[#257180] hover:bg-[#257180]/20 hover:text-[#257180]'
                        : 'hover:bg-gray-100'
                        }`}
                      onClick={() => setActiveTab(item.id)}
                    >
                      <Icon className={`h-4 w-4 mr-3 ${isActive ? 'text-[#257180]' : 'text-gray-500'}`} />
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <Badge className="ml-auto h-5 px-2 bg-[#257180] text-white">
                          {item.badge}
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-lg shadow-sm border-2 border-[#FD8B51] p-6">
              {renderTabContent()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

