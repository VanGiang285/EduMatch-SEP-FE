"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/basic/button';
import { Badge } from '@/components/ui/basic/badge';
import { Star, ThumbsUp, ThumbsDown, MessageSquare, Filter, Search, StarIcon } from 'lucide-react';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/form/select';
import { Input } from '@/components/ui/form/input';

// Mock data - in real app, this would come from API
const mockReviews = [
  {
    id: 1,
    tutorName: 'Nguyễn Văn A',
    tutorAvatar: null,
    rating: 5,
    comment: 'Gia sư rất nhiệt tình và có phương pháp dạy hay. Tôi đã hiểu rõ hơn về môn Toán sau khi học với thầy.',
    date: '2024-01-15',
    sessionSubject: 'Toán học - Lớp 12',
    sessionDate: '2024-01-14',
    helpful: 3,
    isHelpful: false
  },
  {
    id: 2,
    tutorName: 'Trần Thị B',
    tutorAvatar: null,
    rating: 4,
    comment: 'Cô giáo dạy rất dễ hiểu, nhưng đôi khi hơi nhanh. Nhìn chung là hài lòng với chất lượng giảng dạy.',
    date: '2024-01-10',
    sessionSubject: 'Vật lý - Lớp 11',
    sessionDate: '2024-01-09',
    helpful: 1,
    isHelpful: true
  },
  {
    id: 3,
    tutorName: 'Lê Văn C',
    tutorAvatar: null,
    rating: 5,
    comment: 'Thầy rất kiên nhẫn và giải thích rất chi tiết. Tôi đã cải thiện đáng kể điểm số môn Hóa học.',
    date: '2024-01-08',
    sessionSubject: 'Hóa học - Lớp 10',
    sessionDate: '2024-01-07',
    helpful: 5,
    isHelpful: false
  }
];

export default function ReviewsPage() {
  const [reviews] = useState(mockReviews);
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = 
      review.tutorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.sessionSubject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRating = ratingFilter === 'all' || review.rating.toString() === ratingFilter;
    
    return matchesSearch && matchesRating;
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'oldest':
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      default:
        return 0;
    }
  });

  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: (reviews.filter(r => r.rating === rating).length / reviews.length) * 100
  }));

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-[#FD8B51] p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Star className="h-8 w-8 mr-3 text-[#257180]" />
              Đánh giá
            </h1>
            <p className="text-gray-600 mt-1">
              Xem và quản lý đánh giá từ học viên
            </p>
          </div>
        </div>
      </div>

      {/* Rating Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border border-[#FD8B51] shadow-sm">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                {renderStars(Math.round(averageRating))}
              </div>
              <p className="text-3xl font-bold text-[#257180]">{averageRating.toFixed(1)}</p>
              <p className="text-sm text-gray-600">Đánh giá trung bình</p>
              <p className="text-xs text-gray-500 mt-1">Dựa trên {reviews.length} đánh giá</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{reviews.length}</p>
              <p className="text-sm text-gray-600">Tổng đánh giá</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">
                {reviews.filter(r => r.rating >= 4).length}
              </p>
              <p className="text-sm text-gray-600">Đánh giá tích cực</p>
              <p className="text-xs text-gray-500 mt-1">
                ({((reviews.filter(r => r.rating >= 4).length / reviews.length) * 100).toFixed(0)}%)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rating Distribution */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-900">Phân bố đánh giá</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 w-16">
                  <span className="text-sm font-medium text-gray-700">{rating}</span>
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                </div>
                <div className="flex-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-12 text-right">
                  <span className="text-sm text-gray-600">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900">Bộ lọc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tìm kiếm theo gia sư, nội dung..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300 focus:border-[#257180] focus:ring-[#257180]"
                />
              </div>
            </div>
            
            <Select value={ratingFilter} onValueChange={setRatingFilter}>
              <SelectTrigger className="w-full sm:w-48 border-gray-300 focus:border-[#257180] focus:ring-[#257180]">
                <SelectValue placeholder="Đánh giá" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả đánh giá</SelectItem>
                <SelectItem value="5">5 sao</SelectItem>
                <SelectItem value="4">4 sao</SelectItem>
                <SelectItem value="3">3 sao</SelectItem>
                <SelectItem value="2">2 sao</SelectItem>
                <SelectItem value="1">1 sao</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48 border-gray-300 focus:border-[#257180] focus:ring-[#257180]">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mới nhất</SelectItem>
                <SelectItem value="oldest">Cũ nhất</SelectItem>
                <SelectItem value="highest">Đánh giá cao nhất</SelectItem>
                <SelectItem value="lowest">Đánh giá thấp nhất</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="flex items-center text-lg font-semibold text-gray-900">
            <Star className="h-5 w-5 mr-2 text-gray-600" />
            Danh sách đánh giá ({sortedReviews.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-200">
            {sortedReviews.map((review) => (
              <div key={review.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-4">
                  {/* Tutor Avatar */}
                  <div className="h-12 w-12 rounded-full bg-[#F2E5BF] flex items-center justify-center">
                    {review.tutorAvatar ? (
                      <img 
                        src={review.tutorAvatar} 
                        alt={review.tutorName} 
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium text-[#257180]">
                        {review.tutorName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Review Content */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {review.tutorName}
                        </h3>
                        <div className="flex items-center space-x-1">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(review.date).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    
                    <div className="mb-3">
                      <Badge className="bg-blue-100 text-blue-800 border border-blue-200">
                        {review.sessionSubject}
                      </Badge>
                      <span className="text-sm text-gray-500 ml-2">
                        Buổi học: {new Date(review.sessionDate).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    
                    <p className="text-gray-700 mb-4">{review.comment}</p>
                    
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800">
                          <ThumbsUp className="h-4 w-4" />
                          <span>Hữu ích ({review.helpful})</span>
                        </button>
                        <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800">
                          <MessageSquare className="h-4 w-4" />
                          <span>Phản hồi</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {sortedReviews.length === 0 && (
            <div className="text-center py-12">
              <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Không tìm thấy đánh giá nào</p>
              <p className="text-gray-400 text-sm mt-1">Thử thay đổi bộ lọc để tìm kiếm</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


