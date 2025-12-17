 "use client";
 
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/basic/button';
import { Textarea } from '@/components/ui/form/textarea';
import { Loader2, StickyNote, X, ZoomIn, FileText, Send, Upload, Image as ImageIcon, Video, Eye, Edit, GraduationCap, User } from 'lucide-react';
import { useBookingNotes } from '@/hooks/useBookingNotes';
import { toast } from 'sonner';
import { MediaType } from '@/types/enums';
import { MediaService } from '@/services/mediaService';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/feedback/dialog';
import { Label } from '@/components/ui/form/label';
import { Input } from '@/components/ui/form/input';

interface BookingNotesPanelProps {
  bookingId: number;
  userRole?: 'learner' | 'tutor';
  tutorEmail?: string;
  learnerEmail?: string;
  tutorProfile?: any;
  learnerProfile?: any;
}

export function BookingNotesPanel({ bookingId, userRole, tutorEmail, learnerEmail, tutorProfile, learnerProfile }: BookingNotesPanelProps) {
  const { notes, loading, error, loadNotes, createNote, updateNote, deleteNote } =
    useBookingNotes(bookingId);
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mediaItems, setMediaItems] = useState<
    { mediaType: MediaType; fileUrl: string; filePublicId?: string; displayName?: string; file?: File }[]
  >([]);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [previewMedia, setPreviewMedia] = useState<{ url: string; type: MediaType; name?: string } | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editMediaItems, setEditMediaItems] = useState<
    { mediaType: MediaType; fileUrl: string; filePublicId?: string; displayName?: string; file?: File }[]
  >([]);
  const [editMediaFiles, setEditMediaFiles] = useState<File[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const editTextareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (bookingId) {
      loadNotes(bookingId);
    }
  }, [bookingId, loadNotes]);

  useEffect(() => {
    if (error) {
      toast.error('Lỗi khi tải ghi chú', error);
    }
  }, [error]);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      const created = await createNote({
        bookingId,
        content: content.trim(),
        media: mediaItems,
      });
      if (created) {
        toast.success('Thêm ghi chú thành công');
        setContent('');
        setMediaItems([]);
        setMediaFiles([]);
      } else {
        toast.error('Không thể thêm ghi chú');
      }
    } catch (err: any) {
      toast.error('Lỗi khi lưu ghi chú', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (note: typeof notes[number]) => {
    if (!note?.id || note.id <= 0) {
      toast.error('Ghi chú không hợp lệ: ID không tồn tại');
      console.error('Invalid note ID:', note?.id, 'Full note:', note);
      return;
    }
    console.log('🔍 handleEdit - Note ID:', note.id, 'Full note:', note);
    setEditingNoteId(note.id);
    setEditContent(note.content);
    setEditMediaItems(
      (note.media || []).map(m => ({
        mediaType: m.mediaType as MediaType,
        fileUrl: m.fileUrl,
        filePublicId: m.filePublicId,
        displayName: renderFileName(m.fileUrl.split('/').pop(), m.fileUrl),
      }))
    );
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editingNoteId || editingNoteId <= 0) {
      toast.error('Lỗi: Không tìm thấy ID ghi chú hợp lệ');
      console.error('❌ Invalid editingNoteId:', editingNoteId);
      return;
    }
    
    if (!editContent.trim()) {
      toast.error('Vui lòng nhập nội dung ghi chú');
      return;
    }
    
    console.log('🔍 handleEditSubmit - editingNoteId:', editingNoteId);
    setSubmitting(true);
    try {
      const updated = await updateNote({
        id: editingNoteId,
        content: editContent.trim(),
        media: editMediaItems,
      });
      if (updated) {
        toast.success('Cập nhật ghi chú thành công');
        setEditDialogOpen(false);
        setEditingNoteId(null);
        setEditContent('');
        setEditMediaItems([]);
        setEditMediaFiles([]);
      } else {
        toast.error('Không thể cập nhật ghi chú');
      }
    } catch (err: any) {
      toast.error('Lỗi khi cập nhật ghi chú', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user?.email) {
      toast.error('Vui lòng đăng nhập để upload file');
      return;
    }
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      if (!isImage && !isVideo) {
        toast.error('Chỉ chấp nhận file ảnh hoặc video');
        return false;
      }
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error(`File ${file.name} vượt quá 10MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = validFiles.map(async (file) => {
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        const mediaType = isImage ? 'Image' : isVideo ? 'Video' : 'Image';
        
        const response = await MediaService.uploadFile({
          file,
          ownerEmail: user.email!,
          mediaType: mediaType as 'Image' | 'Video',
        });

        const uploadPayload = response.data as any;
        const secureUrl =
          uploadPayload?.secureUrl ?? uploadPayload?.data?.secureUrl;
        const publicId =
          uploadPayload?.publicId ?? uploadPayload?.data?.publicId;

        if (secureUrl) {
          const mediaTypeNum = isImage ? MediaType.Image : MediaType.Video;
          return {
            mediaType: mediaTypeNum,
            fileUrl: secureUrl,
            filePublicId: publicId || undefined,
            displayName: file.name,
            file: file,
          };
        } else {
          const uploadErrorMessage =
            (typeof uploadPayload?.message === 'string' &&
              uploadPayload.message) ||
            (typeof uploadPayload?.error === 'string' && uploadPayload.error) ||
            `Không thể upload file ${file.name}`;
          throw new Error(uploadErrorMessage);
        }
      });

      const results = await Promise.all(uploadPromises);
      setEditMediaItems(prev => [...prev, ...results]);
      setEditMediaFiles(prev => [...prev, ...validFiles]);
      toast.success(`Đã upload ${results.length} file thành công`);
    } catch (error: any) {
      console.error('Error uploading files:', error);
      toast.error(error.message || 'Không thể upload file');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeEditMedia = (index: number) => {
    setEditMediaItems(prev => prev.filter((_, i) => i !== index));
    setEditMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDelete = async (id: number) => {
    const ok = await deleteNote(id);
    if (ok) {
      toast.success('Xóa ghi chú thành công');
    } else {
      toast.error('Không thể xóa ghi chú');
    }
  };

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user?.email) {
      toast.error('Vui lòng đăng nhập để upload file');
      return;
    }
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      if (!isImage && !isVideo) {
        toast.error('Chỉ chấp nhận file ảnh hoặc video');
        return false;
      }
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error(`File ${file.name} vượt quá 10MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = validFiles.map(async (file) => {
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        const mediaType = isImage ? 'Image' : isVideo ? 'Video' : 'Image';
        
        const response = await MediaService.uploadFile({
          file,
          ownerEmail: user.email!,
          mediaType: mediaType as 'Image' | 'Video',
        });

        const uploadPayload = response.data as any;
        const secureUrl =
          uploadPayload?.secureUrl ?? uploadPayload?.data?.secureUrl;
        const publicId =
          uploadPayload?.publicId ?? uploadPayload?.data?.publicId;

        if (secureUrl) {
          const mediaTypeNum = isImage ? MediaType.Image : MediaType.Video;
          return {
            mediaType: mediaTypeNum,
            fileUrl: secureUrl,
            filePublicId: publicId || undefined,
            displayName: file.name,
            file: file,
          };
        } else {
          const uploadErrorMessage =
            (typeof uploadPayload?.message === 'string' &&
              uploadPayload.message) ||
            (typeof uploadPayload?.error === 'string' && uploadPayload.error) ||
            `Không thể upload file ${file.name}`;
          throw new Error(uploadErrorMessage);
        }
      });

      const results = await Promise.all(uploadPromises);
      setMediaItems(prev => [...prev, ...results]);
      setMediaFiles(prev => [...prev, ...validFiles]);
      toast.success(`Đã upload ${results.length} file thành công`);
    } catch (error: any) {
      console.error('Error uploading files:', error);
      toast.error(error.message || 'Không thể upload file');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeMedia = (index: number) => {
    setMediaItems(prev => prev.filter((_, i) => i !== index));
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    if (e.key === 'Enter') {
      e.preventDefault();
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const before = content.slice(0, start);
      const after = content.slice(end);
      const insert = '\n- ';
      let nextAfter = after;
      if (after.length > 0) {
        const firstChar = after[0];
        const upper =
          firstChar.length === 1 ? firstChar.toUpperCase() : firstChar;
        nextAfter = upper + after.slice(1);
      }
      const nextContent = before + insert + nextAfter;
      setContent(nextContent);
      requestAnimationFrame(() => {
        const pos = start + insert.length;
        target.selectionStart = target.selectionEnd = pos;
      });
    } else if (e.key === 'Tab') {
      const start = target.selectionStart;
      const end = target.selectionEnd;
      // Xác định đầu dòng hiện tại
      const lastNewline = content.lastIndexOf('\n', start - 1);
      const col = start - (lastNewline + 1);
      // Chỉ chèn "+ " khi đang ở đầu dòng (col === 0)
      if (col === 0) {
        e.preventDefault();
        const before = content.slice(0, start);
        const after = content.slice(end);
        const insert = '\t+ ';
        const nextContent = before + insert + after;
        setContent(nextContent);
        requestAnimationFrame(() => {
          const pos = start + insert.length;
          target.selectionStart = target.selectionEnd = pos;
        });
      }
    }
  };

  const renderFileName = (name?: string, url?: string) => {
    if (name) return name;
    if (!url) return 'Tệp đính kèm';
    const parts = url.split('/');
    return parts[parts.length - 1] || 'Tệp đính kèm';
  };

  const isNoteFromCurrentUser = (noteEmail?: string) => {
    if (!noteEmail || !userRole) return false;
    if (userRole === 'tutor' && tutorEmail) {
      return noteEmail.toLowerCase() === tutorEmail.toLowerCase();
    }
    if (userRole === 'learner' && learnerEmail) {
      return noteEmail.toLowerCase() === learnerEmail.toLowerCase();
    }
    return false;
  };

  const getNoteAuthorRole = (noteEmail?: string): 'tutor' | 'learner' | null => {
    if (!noteEmail) return null;
    if (tutorEmail && noteEmail.toLowerCase() === tutorEmail.toLowerCase()) return 'tutor';
    if (learnerEmail && noteEmail.toLowerCase() === learnerEmail.toLowerCase()) return 'learner';
    return null;
  };

  const getAuthorName = (noteEmail?: string) => {
    if (!noteEmail) return 'Ẩn danh';
    const authorRole = getNoteAuthorRole(noteEmail);
    if (authorRole === 'tutor') {
      return tutorProfile?.userName || tutorEmail || 'Gia sư';
    }
    if (authorRole === 'learner') {
      return learnerProfile?.user?.userName || learnerEmail || 'Học viên';
    }
    return noteEmail;
  };

  return (
    <div className="space-y-6">
      <Card className="border border-gray-300">
        <CardHeader>
          <CardTitle>Thêm ghi chú mới</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={
                userRole === 'tutor'
                  ? 'Nhập ghi chú về tiến độ học tập của học viên...'
                  : 'Nhập ghi chú về bài học, thắc mắc cần hỏi gia sư...'
              }
              rows={4}
              onKeyDown={onKeyDown}
            />

            <div>
              <Label htmlFor="note-file" className="cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#257180] transition-colors">
                  {uploading ? (
                    <>
                      <Loader2 className="w-6 h-6 mx-auto mb-2 text-gray-400 animate-spin" />
                      <p className="text-gray-600">Đang tải...</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-600">Đính kèm ảnh hoặc video</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, MP4 tối đa 10MB</p>
                    </>
                  )}
                </div>
              </Label>
              <Input
                id="note-file"
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={handleFiles}
                disabled={uploading}
              />
            </div>

            {mediaItems.length > 0 && (
              <div className="space-y-2">
                <Label>Đã upload ({mediaItems.length} file):</Label>
                <div className="grid grid-cols-2 gap-2">
                  {mediaItems.map((item, index) => {
                    const file = mediaFiles[index] || item.file;
                    const isImage = file 
                      ? file.type.startsWith('image/')
                      : item.mediaType === MediaType.Image;
                    return (
                      <div
                        key={index}
                        className="relative group border rounded-lg overflow-hidden bg-gray-50"
                      >
                        {isImage ? (
                          <img
                            src={item.fileUrl}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-24 object-cover"
                          />
                        ) : (
                          <div className="w-full h-24 flex items-center justify-center bg-gray-100">
                            <Video className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeMedia(index)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <div className="p-2">
                          <p className="text-xs text-gray-600 truncate">
                            {item.displayName || file?.name || `File ${index + 1}`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <Button
              onClick={handleSubmit}
              disabled={submitting || !content.trim()}
              className="bg-[#257180] hover:bg-[#1f5a66] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Thêm ghi chú
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="font-medium">Lịch sử ghi chú ({notes.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-[#257180]" />
            </div>
          ) : notes.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600">Chưa có ghi chú nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notes
                .slice()
                .sort(
                  (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                )
                .map(note => {
                  const isCurrentUser = isNoteFromCurrentUser(note.createdByEmail);
                  const authorRole = getNoteAuthorRole(note.createdByEmail);
                  return (
                    <div
                      key={note.id}
                      className={`p-4 rounded-lg ${
                        isCurrentUser ? 'bg-blue-50 ml-8' : 'bg-gray-50 mr-8'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-gray-900">
                              {getAuthorName(note.createdByEmail)}
                            </p>
                            {authorRole && (
                              <div className="flex items-center gap-1 text-xs text-gray-600">
                                {authorRole === 'tutor' ? (
                                  <>
                                    <GraduationCap className="h-3 w-3" />
                                    <span className="font-medium">Gia sư</span>
                                  </>
                                ) : (
                                  <>
                                    <User className="h-3 w-3" />
                                    <span className="font-medium">Học viên</span>
                                  </>
                                )}
                              </div>
                            )}
                            {isCurrentUser && (
                              <div className="ml-auto flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(note)}
                                  className="border-gray-300 bg-white hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51] h-7 px-2 text-xs"
                                >
                                  <Edit className="h-3 w-3 mr-1" />
                                  Sửa
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(note.id)}
                                  className="border-gray-300 bg-white hover:bg-red-50 hover:text-red-600 hover:border-red-300 h-7 px-2 text-xs"
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  Xóa
                                </Button>
                              </div>
                            )}
                          </div>
                          <p className="text-gray-600 mb-2 whitespace-pre-line">{note.content}</p>

                          {note.media && note.media.length > 0 && (
                            <div className="mt-2 space-y-2">
                              {note.media.map((attachment) => {
                                const mediaTypeValue = typeof attachment.mediaType === 'number' 
                                  ? attachment.mediaType 
                                  : typeof attachment.mediaType === 'string'
                                    ? (attachment.mediaType === 'Image' || attachment.mediaType === '0' ? MediaType.Image : MediaType.Video)
                                    : null;
                                
                                let isImage = mediaTypeValue === MediaType.Image;
                                if (mediaTypeValue === null) {
                                  const url = attachment.fileUrl.toLowerCase();
                                  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
                                  isImage = imageExtensions.some(ext => url.includes(ext));
                                }
                                
                                return (
                                  <div
                                    key={attachment.id}
                                    className="flex items-center gap-2 p-2 bg-white rounded border border-gray-200"
                                  >
                                    {isImage ? (
                                      <ImageIcon className="w-4 h-4 text-blue-600" />
                                    ) : (
                                      <Video className="w-4 h-4 text-purple-600" />
                                    )}
                                    <span className="text-gray-700">{renderFileName(attachment.fileUrl.split('/').pop(), attachment.fileUrl)}</span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="ml-auto p-2 hover:bg-[#FD8B51] hover:text-white"
                                      onClick={() =>
                                        setPreviewMedia({
                                          url: attachment.fileUrl,
                                          type: isImage ? MediaType.Image : MediaType.Video,
                                          name: renderFileName(attachment.fileUrl.split('/').pop(), attachment.fileUrl),
                                        })
                                      }
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(note.createdAt).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!previewMedia} onOpenChange={(open) => !open && setPreviewMedia(null)}>
        <DialogContent className="max-w-6xl p-0 overflow-hidden bg-white rounded-2xl border border-gray-300 shadow-lg">
          <div className="bg-white">
            {previewMedia?.name && (
              <div className="px-4 py-3 text-sm font-semibold text-gray-900 border-b border-gray-200">
                {previewMedia.name}
              </div>
            )}
            {previewMedia?.type === MediaType.Image ? (
              <div className="w-full max-h-[85vh] bg-black/5 flex items-center justify-center">
                <img
                  src={previewMedia.url}
                  alt="preview"
                  className="object-contain max-h-[85vh] w-full"
                />
              </div>
            ) : previewMedia ? (
              <div className="w-full max-h-[85vh] bg-black/5 flex items-center justify-center">
                <video
                  src={previewMedia.url}
                  controls
                  className="object-contain max-h-[85vh] w-full"
                />
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setEditDialogOpen(false);
          setEditingNoteId(null);
          setEditContent('');
          setEditMediaItems([]);
          setEditMediaFiles([]);
        }
      }}>
        <DialogContent className="max-w-2xl border border-gray-300 shadow-lg">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa ghi chú</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Nội dung ghi chú</Label>
              <Textarea
                ref={editTextareaRef}
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                placeholder={
                  userRole === 'tutor'
                    ? 'Nhập ghi chú về tiến độ học tập của học viên...'
                    : 'Nhập ghi chú về bài học, thắc mắc cần hỏi gia sư...'
                }
                rows={6}
              />
            </div>

            <div>
              <Label htmlFor="edit-note-file" className="cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#257180] transition-colors">
                  {uploading ? (
                    <>
                      <Loader2 className="w-6 h-6 mx-auto mb-2 text-gray-400 animate-spin" />
                      <p className="text-gray-600">Đang tải...</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                      <p className="text-gray-600">Đính kèm ảnh hoặc video</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, MP4 tối đa 10MB</p>
                    </>
                  )}
                </div>
              </Label>
              <Input
                id="edit-note-file"
                type="file"
                accept="image/*,video/*"
                multiple
                className="hidden"
                onChange={handleEditFiles}
                disabled={uploading}
              />
            </div>

            {editMediaItems.length > 0 && (
              <div className="space-y-2">
                <Label>Đã upload ({editMediaItems.length} file):</Label>
                <div className="grid grid-cols-2 gap-2">
                  {editMediaItems.map((item, index) => {
                    const file = editMediaFiles[index] || item.file;
                    const isImage = file 
                      ? file.type.startsWith('image/')
                      : item.mediaType === MediaType.Image;
                    return (
                      <div
                        key={index}
                        className="relative group border rounded-lg overflow-hidden bg-gray-50"
                      >
                        {isImage ? (
                          <img
                            src={item.fileUrl}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-24 object-cover"
                          />
                        ) : (
                          <div className="w-full h-24 flex items-center justify-center bg-gray-100">
                            <Video className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeEditMedia(index)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                        <div className="p-2">
                          <p className="text-xs text-gray-600 truncate">
                            {item.displayName || file?.name || `File ${index + 1}`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t border-[#257180]/20">
              <Button
                variant="outline"
                onClick={() => {
                  setEditDialogOpen(false);
                  setEditingNoteId(null);
                  setEditContent('');
                  setEditMediaItems([]);
                  setEditMediaFiles([]);
                }}
                disabled={submitting}
                className="border-gray-300 bg-white hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
              >
                Hủy
              </Button>
              <Button
                onClick={handleEditSubmit}
                disabled={submitting || !editContent.trim()}
                className="bg-[#257180] hover:bg-[#1f5a66] text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Cập nhật ghi chú
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


