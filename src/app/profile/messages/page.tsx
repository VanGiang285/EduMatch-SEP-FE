"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/basic/button';
import { Badge } from '@/components/ui/basic/badge';
import { MessageSquare, Send, Paperclip, Smile, Search, Filter, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/form/input';

// Mock data - in real app, this would come from API
const mockConversations = [
  {
    id: 1,
    participantName: 'Nguyễn Văn A',
    participantAvatar: null,
    lastMessage: 'Cảm ơn bạn đã dạy tôi hôm nay!',
    lastMessageTime: '2024-01-15T14:30:00',
    unreadCount: 2,
    isOnline: true,
    role: 'tutor'
  },
  {
    id: 2,
    participantName: 'Trần Thị B',
    participantAvatar: null,
    lastMessage: 'Buổi học ngày mai có thể bắt đầu sớm hơn không?',
    lastMessageTime: '2024-01-15T12:15:00',
    unreadCount: 0,
    isOnline: false,
    role: 'learner'
  },
  {
    id: 3,
    participantName: 'Lê Văn C',
    participantAvatar: null,
    lastMessage: 'Tôi đã gửi bài tập về nhà qua email',
    lastMessageTime: '2024-01-14T20:45:00',
    unreadCount: 1,
    isOnline: true,
    role: 'tutor'
  }
];

const mockMessages = [
  {
    id: 1,
    senderId: 'current-user',
    content: 'Xin chào, tôi muốn đặt lịch học Toán vào ngày mai',
    timestamp: '2024-01-15T14:00:00',
    type: 'text'
  },
  {
    id: 2,
    senderId: 'tutor-1',
    content: 'Chào bạn! Tôi có thể dạy vào 14:00-15:30 ngày mai. Bạn có phù hợp không?',
    timestamp: '2024-01-15T14:05:00',
    type: 'text'
  },
  {
    id: 3,
    senderId: 'current-user',
    content: 'Vâng, thời gian đó rất phù hợp với tôi. Cảm ơn bạn!',
    timestamp: '2024-01-15T14:10:00',
    type: 'text'
  },
  {
    id: 4,
    senderId: 'tutor-1',
    content: 'Tuyệt vời! Tôi sẽ gửi link Google Meet trước 10 phút. Chúc bạn học tốt!',
    timestamp: '2024-01-15T14:12:00',
    type: 'text'
  }
];

export default function MessagesPage() {
  const [conversations] = useState(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
  const [messages] = useState(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.participantName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // TODO: Implement send message API call
      console.log('Sending message:', newMessage);
      setNewMessage('');
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('vi-VN');
    }
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-200px)]">
      <div className="bg-white rounded-lg shadow-sm border border-[#FD8B51] h-full flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <MessageSquare className="h-8 w-8 mr-3 text-[#257180]" />
                Tin nhắn
              </h1>
              <p className="text-gray-600 mt-1">
                Giao tiếp với gia sư và học viên
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-100 text-green-800 border border-green-200">
                {conversations.filter(c => c.unreadCount > 0).length} tin nhắn mới
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Conversations List */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm cuộc trò chuyện..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-[#257180] focus:ring-[#257180]"
                />
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedConversation?.id === conversation.id ? 'bg-[#F2E5BF]' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="h-12 w-12 rounded-full bg-[#F2E5BF] flex items-center justify-center">
                        {conversation.participantAvatar ? (
                          <img 
                            src={conversation.participantAvatar} 
                            alt={conversation.participantName} 
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium text-[#257180]">
                            {conversation.participantName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      {conversation.isOnline && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                          {conversation.participantName}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {formatTime(conversation.lastMessageTime)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.lastMessage}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <Badge className="bg-[#FD8B51] text-white text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-[#F2E5BF] flex items-center justify-center">
                        {selectedConversation.participantAvatar ? (
                          <img 
                            src={selectedConversation.participantAvatar} 
                            alt={selectedConversation.participantName} 
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium text-[#257180]">
                            {selectedConversation.participantName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                          {selectedConversation.participantName}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {selectedConversation.isOnline ? 'Đang hoạt động' : 'Không hoạt động'}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === 'current-user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.senderId === 'current-user'
                            ? 'bg-[#FD8B51] text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className={`text-xs mt-1 ${
                          message.senderId === 'current-user' ? 'text-white/70' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <div className="flex-1">
                      <Input
                        placeholder="Nhập tin nhắn..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="border-gray-300 focus:border-[#257180] focus:ring-[#257180]"
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      <Smile className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={handleSendMessage}
                      className="bg-[#FD8B51] hover:bg-[#FD8B51]/90 text-white"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Chọn một cuộc trò chuyện để bắt đầu</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


