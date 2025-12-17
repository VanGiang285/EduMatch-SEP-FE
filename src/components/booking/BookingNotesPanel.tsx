 "use client";
 
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/basic/button';
import { Textarea } from '@/components/ui/form/textarea';
import { Loader2, StickyNote, X, ZoomIn } from 'lucide-react';
import { useBookingNotes } from '@/hooks/useBookingNotes';
import { toast } from 'sonner';
import { MediaType } from '@/types/enums';
import { MediaService } from '@/services/mediaService';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent } from '@/components/ui/feedback/dialog';

interface BookingNotesPanelProps {
  bookingId: number;
}

export function BookingNotesPanel({ bookingId }: BookingNotesPanelProps) {
  const { notes, loading, error, loadNotes, createNote, updateNote, deleteNote } =
    useBookingNotes(bookingId);
    const { user } = useAuth();
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mediaItems, setMediaItems] = useState<
    { mediaType: MediaType; fileUrl: string; filePublicId?: string; displayName?: string }[]
  >([]);
  const [previewMedia, setPreviewMedia] = useState<{ url: string; type: MediaType; name?: string } | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [detailNote, setDetailNote] = useState<typeof notes[number] | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

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
      if (editingId) {
        const updated = await updateNote({
          id: editingId,
          content: content.trim(),
          media: mediaItems,
        });
        if (updated) {
          toast.success('Cập nhật ghi chú thành công');
          setEditingId(null);
          setContent('');
          setMediaItems([]);
        } else {
          toast.error('Không thể cập nhật ghi chú');
        }
      } else {
        const created = await createNote({
          bookingId,
          content: content.trim(),
          media: mediaItems,
        });
        if (created) {
          toast.success('Thêm ghi chú thành công');
          setContent('');
          setMediaItems([]);
        } else {
          toast.error('Không thể thêm ghi chú');
        }
      }
    } catch (err: any) {
      toast.error('Lỗi khi lưu ghi chú', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (id: number) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      setEditingId(id);
      setContent(note.content);
      setMediaItems(
        (note.media || []).map(m => ({
          mediaType: m.mediaType as MediaType,
          fileUrl: m.fileUrl,
          filePublicId: m.filePublicId,
          displayName: m.fileUrl.split('/').pop(),
        }))
      );
    }
  };

  const handleDelete = async (id: number) => {
    const ok = await deleteNote(id);
    if (ok) {
      toast.success('Xóa ghi chú thành công');
      if (editingId === id) {
        setEditingId(null);
        setContent('');
        setMediaItems([]);
      }
    } else {
      toast.error('Không thể xóa ghi chú');
    }
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      const uploaded: { mediaType: MediaType; fileUrl: string; filePublicId?: string; displayName?: string }[] = [];
      for (const file of Array.from(files)) {
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        if (!isImage && !isVideo) {
          toast.error('Định dạng không hỗ trợ', 'Chỉ chấp nhận ảnh hoặc video.');
          continue;
        }
        const mediaType: MediaType = isImage ? MediaType.Image : MediaType.Video;
        const ownerEmail = user?.email || 'unknown@user';
        const response = await MediaService.uploadFile({
          file,
          ownerEmail,
          mediaType: isImage ? 'Image' : 'Video',
        });
        const payload = response.data;
        const uploadedData = payload?.data;
        const uploadOk = response.success && uploadedData;
        if (uploadOk) {
          uploaded.push({
            mediaType,
            fileUrl: uploadedData.secureUrl || uploadedData.originalUrl,
            filePublicId: uploadedData.publicId,
            displayName: file.name,
          });
        } else {
          toast.error('Upload thất bại', response.error?.message || payload?.message);
        }
      }
      if (uploaded.length > 0) {
        setMediaItems(prev => [...prev, ...uploaded]);
      }
    } catch (err: any) {
      toast.error('Lỗi khi upload', err.message);
    } finally {
      setUploading(false);
    }
  };

  const removeMedia = (index: number) => {
    setMediaItems(prev => prev.filter((_, i) => i !== index));
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

  return (
    <Card className="mt-6 border border-[#257180]/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <StickyNote className="h-5 w-5 text-[#257180]" />
          <CardTitle>Ghi chú lớp học</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Thêm ghi chú cho buổi học, nội dung, lưu ý quan trọng..."
            className="min-h-[80px]"
            onKeyDown={onKeyDown}
          />
          <div className="flex flex-wrap gap-2">
            <label className="inline-flex items-center px-3 py-2 border border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 text-sm text-gray-700">
              <input
                type="file"
                className="hidden"
                accept="image/*,video/*"
                multiple
                onChange={(e) => handleFiles(e.target.files)}
              />
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin text-[#257180]" />
                  Đang tải...
                </>
              ) : (
                'Thêm ảnh / video'
              )}
            </label>
            {mediaItems.length > 0 && (
              <span className="text-xs text-gray-600 self-center">
                Đã đính kèm {mediaItems.length} tệp
              </span>
            )}
          </div>
          {mediaItems.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {mediaItems.map((m, idx) => (
                <div key={idx} className="relative w-28 h-28 rounded-lg overflow-hidden border border-gray-200 bg-black/5">
                  {m.mediaType === MediaType.Image ? (
                    <img
                      src={m.fileUrl}
                      alt="preview"
                      className="object-cover w-full h-full cursor-pointer"
                      onClick={() => setPreviewMedia({ url: m.fileUrl, type: MediaType.Image, name: renderFileName(m.displayName, m.fileUrl) })}
                    />
                  ) : (
                    <video
                      src={m.fileUrl}
                      className="object-cover w-full h-full cursor-pointer"
                      onClick={() => setPreviewMedia({ url: m.fileUrl, type: MediaType.Video, name: renderFileName(m.displayName, m.fileUrl) })}
                    />
                  )}
                  <div className="absolute top-1 right-1 flex gap-1">
                    <button
                      className="bg-white/80 rounded-full p-1 hover:bg-white"
                      onClick={() => setPreviewMedia({ url: m.fileUrl, type: m.mediaType, name: renderFileName(m.displayName, m.fileUrl) })}
                    >
                      <ZoomIn className="h-4 w-4 text-gray-600" />
                    </button>
                    <button
                      className="bg-white/80 rounded-full p-1 hover:bg-white"
                      onClick={() => removeMedia(idx)}
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                  <div className="absolute bottom-1 left-1 text-[10px] px-1 py-0.5 rounded bg-black/60 text-white">
                    {renderFileName(m.displayName, m.fileUrl)}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end gap-2">
            {editingId && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingId(null);
                  setContent('');
                }}
              >
                Hủy chỉnh sửa
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              onClick={handleSubmit}
              disabled={submitting || !content.trim()}
              className="bg-[#257180] hover:bg-[#257180]/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : editingId ? (
                'Cập nhật ghi chú'
              ) : (
                'Thêm ghi chú'
              )}
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-[#257180]" />
          </div>
        ) : notes.length === 0 ? (
          <div className="text-sm text-gray-500">
            Chưa có ghi chú nào cho booking này.
          </div>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {notes
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .map(note => (
                <div key={note.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    className={`w-full text-left px-3 py-3 flex flex-col gap-2 ${expandedIds.has(note.id) ? 'bg-gray-100' : 'bg-white'} hover:bg-gray-50`}
                    onClick={() =>
                      setExpandedIds(prev => {
                        const next = new Set(prev);
                        if (next.has(note.id)) next.delete(note.id);
                        else next.add(note.id);
                        return next;
                      })
                    }
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="text-sm font-semibold text-gray-900 line-clamp-1 max-w-[220px] truncate">
                          {note.content}
                        </div>
                        <div className="text-xs text-gray-600">
                          {new Date(note.createdAt).toLocaleString('vi-VN')}
                        </div>
                      </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                          className="bg-[#257180] text-white hover:bg-[#1e5a66] border-[#257180] px-4 shadow-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDetailNote(note);
                            }}
                          >
                            Xem chi tiết
                          </Button>
                        </div>
                    </div>
                  </button>
                  {expandedIds.has(note.id) && (
                    <div className="px-3 pb-3 bg-white">
                      <div className="text-base text-gray-900 whitespace-pre-line max-h-40 overflow-y-auto pr-1">
                        {note.content}
                      </div>
                      {note.media && note.media.length > 0 && (
                        <div className="flex flex-wrap gap-3 pt-2">
                          {note.media.map(m => (
                            <div key={m.id} className="relative w-28 h-28 rounded-lg overflow-hidden border border-[#257180]/20 bg-black/5">
                              {m.mediaType === MediaType.Image ? (
                                <img
                                  src={m.fileUrl}
                                  alt="preview"
                                  className="object-cover w-full h-full cursor-pointer"
                                  onClick={() =>
                                    setPreviewMedia({
                                      url: m.fileUrl,
                                      type: m.mediaType as MediaType,
                                      name: renderFileName(m.fileUrl.split('/').pop(), m.fileUrl),
                                    })
                                  }
                                />
                              ) : (
                                <video
                                  src={m.fileUrl}
                                  className="object-cover w-full h-full cursor-pointer"
                                  onClick={() =>
                                    setPreviewMedia({
                                      url: m.fileUrl,
                                      type: m.mediaType as MediaType,
                                      name: renderFileName(m.fileUrl.split('/').pop(), m.fileUrl),
                                    })
                                  }
                                />
                              )}
                              <div className="absolute bottom-1 left-1 text-[10px] px-1 py-0.5 rounded bg-black/60 text-white">
                                {m.mediaType === MediaType.Image ? 'Ảnh' : 'Video'}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Update/Xóa chỉ hiển thị trong modal chi tiết, không hiển thị ở dropdown */}
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </CardContent>
      <Dialog open={!!previewMedia} onOpenChange={(open) => !open && setPreviewMedia(null)}>
        <DialogContent className="max-w-6xl p-0 overflow-hidden bg-white rounded-2xl border border-[#257180]/20 shadow-2xl">
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
      <Dialog open={!!detailNote} onOpenChange={(open) => !open && setDetailNote(null)}>
        <DialogContent className="max-w-5xl bg-white rounded-2xl border border-[#257180]/20 shadow-2xl p-0 overflow-hidden">
          {detailNote && (
            <div className="space-y-4 p-6">
              <div className="flex items-start justify-between gap-4 bg-gray-100 p-4 rounded-md">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-gray-900">Ghi chú</h3>
                  <div className="text-sm font-semibold text-gray-900">{detailNote.createdByEmail || 'Ẩn danh'}</div>
                  <div className="text-xs text-gray-600">{new Date(detailNote.createdAt).toLocaleString('vi-VN')}</div>
                </div>
                {user?.email && detailNote.createdByEmail && user.email.toLowerCase() === detailNote.createdByEmail.toLowerCase() && (
                  <div className="flex gap-2 pr-8">
                    <Button
                      variant="outline"
                      className="bg-[#257180] text-white hover:bg-[#1e5a66] border-[#257180] px-4 shadow-sm"
                      onClick={() => {
                        setEditingId(detailNote.id);
                        setContent(detailNote.content);
                        setMediaItems(
                          (detailNote.media || []).map(m => ({
                            mediaType: m.mediaType as MediaType,
                            fileUrl: m.fileUrl,
                            filePublicId: m.filePublicId,
                            displayName: renderFileName(m.fileUrl.split('/').pop(), m.fileUrl),
                          }))
                        );
                        setDetailNote(null);
                      }}
                    >
                      Cập nhật
                    </Button>
                    <Button
                      variant="outline"
                      className="border-red-200 text-red-500"
                      onClick={() => {
                        setDetailNote(null);
                        handleDelete(detailNote.id);
                      }}
                    >
                      Xóa
                    </Button>
                  </div>
                )}
              </div>
              <div className="text-base text-gray-900 whitespace-pre-line bg-white p-3 max-h-56 overflow-y-auto pr-1">
                {detailNote.content}
              </div>
              {detailNote.media && detailNote.media.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {detailNote.media.map(m =>
                    m.mediaType === MediaType.Image ? (
                      <img
                        key={m.id}
                        src={m.fileUrl}
                        alt="img"
                        className="w-48 h-48 object-cover rounded-xl border border-[#257180]/20 shadow-sm cursor-pointer"
                        onClick={() =>
                          setPreviewMedia({
                            url: m.fileUrl,
                            type: m.mediaType as MediaType,
                            name: renderFileName(m.fileUrl.split('/').pop(), m.fileUrl),
                          })
                        }
                      />
                    ) : (
                      <video
                        key={m.id}
                        src={m.fileUrl}
                        controls
                        className="w-48 h-48 object-cover rounded-xl border border-[#257180]/20 shadow-sm cursor-pointer"
                        onClick={() =>
                          setPreviewMedia({
                            url: m.fileUrl,
                            type: m.mediaType as MediaType,
                            name: renderFileName(m.fileUrl.split('/').pop(), m.fileUrl),
                          })
                        }
                      />
                    )
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}


