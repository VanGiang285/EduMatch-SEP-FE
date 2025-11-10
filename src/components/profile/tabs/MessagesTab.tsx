"use client";

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/layout/card';
import { Badge } from '@/components/ui/basic/badge';
import { Button } from '@/components/ui/basic/button';
import { Input } from '@/components/ui/form/input';
import { ScrollArea } from '@/components/ui/layout/scroll-area';
import { MessageCircle, Send, Search, MoreVertical } from 'lucide-react';
import { mockMessages } from '@/data/mockLearnerData';

export function MessagesTab() {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(1);
  const [messageText, setMessageText] = useState('');

  // Mock conversation messages
  const conversationMessages = [
    {
      id: 1,
      senderId: 1,
      senderName: 'Nguyễn Thị Mai',
      message: 'Chào em! Thầy có thể giúp gì cho em?',
      timestamp: '10:30',
      isMine: false,
    },
    {
      id: 2,
      senderId: 'me',
      senderName: 'Tôi',
      message: 'Thầy ơi, em muốn hỏi về bài tập tuần trước ạ',
      timestamp: '10:32',
      isMine: true,
    },
    {
      id: 3,
      senderId: 1,
      senderName: 'Nguyễn Thị Mai',
      message: 'Được em, thầy nghe đây',
      timestamp: '10:33',
      isMine: false,
    },
    {
      id: 4,
      senderId: 'me',
      senderName: 'Tôi',
      message: 'Em có thể học vào buổi tối thứ 3 được không ạ?',
      timestamp: '10:35',
      isMine: true,
    },
  ];

  const handleSendMessage = () => {
    if (!messageText.trim()) return;
    console.log('Send message:', messageText);
    setMessageText('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Tin nhắn</h2>
        <p className="text-gray-600 mt-1">Trò chuyện với gia sư</p>
      </div>

      <Card className="h-[600px] border border-gray-200 hover:shadow-md transition-shadow">
        <CardContent className="p-0 h-full flex">
          {/* Conversations List */}
          <div className="w-80 border-r border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Tìm kiếm..." 
                  className="pl-9"
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="divide-y divide-gray-200">
                {mockMessages.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversation === conversation.id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedConversation(conversation.id)}
                  >
                    <div className="flex gap-3">
                      <div className="relative flex-shrink-0">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#F2E5BF]">
                          {conversation.tutorAvatar ? (
                            <img 
                              src={conversation.tutorAvatar} 
                              alt={conversation.tutorName}
                              className="w-full h-full object-cover rounded-lg"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                if (fallback) {
                                  fallback.style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          <div 
                            className={`w-full h-full rounded-lg flex items-center justify-center text-sm font-bold text-[#257180] bg-[#F2E5BF] ${conversation.tutorAvatar ? 'hidden' : 'flex'}`}
                            style={{ display: conversation.tutorAvatar ? 'none' : 'flex' }}
                          >
                            {conversation.tutorName ? conversation.tutorName.slice(0, 2).toUpperCase() : 'GS'}
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className={`truncate ${!conversation.isRead ? 'font-semibold' : 'font-medium'}`}>
                            {conversation.tutorName}
                          </p>
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {conversation.timestamp}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-sm text-gray-600 truncate ${
                            !conversation.isRead ? 'font-medium' : ''
                          }`}>
                            {conversation.lastMessage}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <Badge 
                              variant="default" 
                              className="bg-[#257180] text-white h-5 min-w-5 px-1.5 text-xs"
                            >
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[#F2E5BF]">
                        {mockMessages.find(m => m.id === selectedConversation)?.tutorAvatar ? (
                          <img 
                            src={mockMessages.find(m => m.id === selectedConversation)?.tutorAvatar} 
                            alt={mockMessages.find(m => m.id === selectedConversation)?.tutorName}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                              if (fallback) {
                                fallback.style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        <div 
                          className={`w-full h-full rounded-lg flex items-center justify-center text-xs font-bold text-[#257180] bg-[#F2E5BF] ${mockMessages.find(m => m.id === selectedConversation)?.tutorAvatar ? 'hidden' : 'flex'}`}
                          style={{ display: mockMessages.find(m => m.id === selectedConversation)?.tutorAvatar ? 'none' : 'flex' }}
                        >
                          {mockMessages.find(m => m.id === selectedConversation)?.tutorName ? mockMessages.find(m => m.id === selectedConversation)!.tutorName.slice(0, 2).toUpperCase() : 'GS'}
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold">
                        {mockMessages.find(m => m.id === selectedConversation)?.tutorName}
                      </p>
                      <p className="text-xs text-gray-500">Đang hoạt động</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {conversationMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.isMine ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${msg.isMine ? 'order-2' : 'order-1'}`}>
                          <div
                            className={`rounded-lg p-3 ${
                              msg.isMine
                                ? 'bg-[#257180] text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p>{msg.message}</p>
                          </div>
                          <p className={`text-xs text-gray-500 mt-1 ${
                            msg.isMine ? 'text-right' : 'text-left'
                          }`}>
                            {msg.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Nhập tin nhắn..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button onClick={handleSendMessage} size="lg" className="bg-[#257180] hover:bg-[#257180]/90 text-white">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Chọn một cuộc trò chuyện để bắt đầu</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
