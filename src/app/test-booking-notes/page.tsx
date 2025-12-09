"use client";

import { useEffect, useState } from "react";
import { PageWrapper } from "@/components/common/PageWrapper";
import { Input } from "@/components/ui/form/input";
import { Label } from "@/components/ui/form/label";
import { Button } from "@/components/ui/basic/button";
import { BookingNotesPanel } from "@/components/booking/BookingNotesPanel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/layout/card";
import { Badge } from "@/components/ui/basic/badge";
import { Dialog, DialogContent } from "@/components/ui/feedback/dialog";
import { useState as useStateReact } from "react";

export default function TestBookingNotesPage() {
  const [bookingIdInput, setBookingIdInput] = useState("");
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [fakeNotes, setFakeNotes] = useStateReact([]);
  useEffect(() => {
    const now = Date.now();
    setFakeNotes([
      {
        id: 1,
        bookingId: 101,
        content: "- Buổi 1: Ôn tập chương 1\n- Chuẩn bị đề cương\n  + In tài liệu",
        createdByEmail: "learner@test.com",
        createdAt: new Date(now).toISOString(),
        media: [
          {
            id: 11,
            bookingNoteId: 1,
            mediaType: 0,
            fileUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800",
            filePublicId: "demo_img",
            createdAt: new Date(now).toISOString(),
          },
        ],
      },
      {
        id: 2,
        bookingId: 101,
        content: "- Buổi 2: Luyện đề\n  + Xem lại lỗi sai\n  + Video tham khảo",
        createdByEmail: "tutor@test.com",
        createdAt: new Date(now - 3600_000).toISOString(),
        media: [
          {
            id: 22,
            bookingNoteId: 2,
            mediaType: 1,
            fileUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
            filePublicId: "demo_vid",
            createdAt: new Date(now).toISOString(),
          },
        ],
      },
    ]);
  }, []);
  const [detailNote, setDetailNote] = useStateReact<any>(null);
  const [expandedFakeIds, setExpandedFakeIds] = useStateReact<Set<number>>(new Set());
  const [previewMedia, setPreviewMedia] = useStateReact<{ url: string; type: "image" | "video"; name?: string } | null>(null);
  const currentUserEmail = "learner@test.com";

  const handleLoad = () => {
    const id = Number(bookingIdInput);
    if (!Number.isNaN(id) && id > 0) {
      setBookingId(id);
    }
  };

  const handleSelectFake = (note: typeof fakeNotes[number]) => {
    setDetailNote(note);
  };

  const handleDeleteFake = (id: number) => {
    setFakeNotes(prev => prev.filter(n => n.id !== id));
    if (detailNote?.id === id) {
      setDetailNote(null);
    }
  };

  const handleUpdateFake = (id: number) => {
    setFakeNotes(prev =>
      prev.map(n =>
        n.id === id
          ? {
              ...n,
              content: n.content + "\n- Cập nhật: kiểm tra tiến độ",
            }
          : n
      )
    );
    if (selectedFake?.id === id) {
      setSelectedFake(prev =>
        prev
          ? { ...prev, content: prev.content + "\n- Cập nhật: kiểm tra tiến độ" }
          : prev
      );
    }
  };

  const renderFileName = (url?: string) => {
    if (!url) return "Tệp đính kèm";
    const parts = url.split("/");
    return parts[parts.length - 1] || "Tệp đính kèm";
  };

  return (
    <PageWrapper currentPage="profile">
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
          <div className="bg-white rounded-2xl border border-[#257180]/20 p-6 space-y-4">
            <h1 className="text-2xl font-semibold text-gray-900">
              Test Booking Notes
            </h1>
            <p className="text-sm text-gray-600">
              Nhập BookingId hợp lệ của bạn (learner hoặc tutor là participant) để test toàn bộ tính năng BookingNotes.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="bookingId">Booking ID</Label>
                <Input
                  id="bookingId"
                  type="number"
                  min={1}
                  value={bookingIdInput}
                  onChange={(e) => setBookingIdInput(e.target.value)}
                  placeholder="Nhập BookingId"
                  className="max-w-xs"
                />
              </div>
              <Button
                type="button"
                onClick={handleLoad}
                className="bg-[#257180] hover:bg-[#257180]/90 text-white"
              >
                Tải ghi chú
              </Button>
            </div>
          </div>

          <Card className="border border-[#257180]/20">
            <CardHeader>
              <CardTitle>Demo giả lập (fake data) - xem chi tiết / cập nhật / xóa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {fakeNotes.map((n) => (
                  <div key={n.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      className={`w-full text-left px-3 py-3 flex flex-col gap-2 ${expandedFakeIds.has(n.id) ? 'bg-gray-100' : 'bg-white'} hover:bg-gray-50`}
                      onClick={() =>
                        setExpandedFakeIds(prev => {
                          const next = new Set(prev);
                          if (next.has(n.id)) next.delete(n.id);
                          else next.add(n.id);
                          return next;
                        })
                      }
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="text-sm font-semibold text-gray-900 line-clamp-1 max-w-[220px] truncate">{n.content}</div>
                          <div className="text-sm font-semibold text-gray-900">{n.createdByEmail}</div>
                          <div className="text-xs text-gray-600">{new Date(n.createdAt).toLocaleString("vi-VN")}</div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-[#257180] text-white hover:bg-[#1e5a66] border-[#257180] px-4 shadow-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDetailNote(n);
                            }}
                          >
                            Xem chi tiết
                          </Button>
                        </div>
                      </div>
                    </button>
                    {expandedFakeIds.has(n.id) && (
                      <div className="px-3 pb-3 space-y-2 bg-white">
                        <div className="text-base text-gray-900 whitespace-pre-line p-3 max-h-40 overflow-y-auto pr-1">
                          {n.content}
                        </div>
                        {n.media && n.media.length > 0 && (
                          <div className="flex flex-wrap gap-3">
                            {n.media.map((m) => (
                              <div key={m.id} className="relative w-28 h-28 rounded-lg overflow-hidden border border-[#257180]/20 bg-black/5">
                                {m.mediaType === 0 ? (
                                  <img
                                    src={m.fileUrl}
                                    alt="preview"
                                    className="object-cover w-full h-full cursor-pointer"
                                    onClick={() =>
                                      setPreviewMedia({
                                        url: m.fileUrl,
                                        type: "image",
                                        name: renderFileName(m.fileUrl),
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
                                        type: "video",
                                        name: renderFileName(m.fileUrl),
                                      })
                                    }
                                  />
                                )}
                                <div className="absolute bottom-1 left-1 text-[10px] px-1 py-0.5 rounded bg-black/60 text-white">
                                  {m.mediaType === 0 ? "Ảnh" : "Video"}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {/* Update/Xóa chỉ hiển thị trong modal chi tiết */}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {bookingId && (
            <div className="bg-white rounded-2xl border border-[#257180]/20 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Booking #{bookingId}
              </h2>
              <BookingNotesPanel bookingId={bookingId} />
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!detailNote} onOpenChange={(open) => !open && setDetailNote(null)}>
        <DialogContent className="max-w-5xl bg-white rounded-2xl border border-[#257180]/20 shadow-2xl p-0 overflow-hidden">
          {detailNote && (
            <div className="space-y-4 p-6">
              <div className="flex items-start justify-between gap-4 bg-gray-100 p-4 rounded-md">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-gray-900">Note</h3>
                  <div className="text-sm font-semibold text-gray-900">{detailNote.createdByEmail}</div>
                  <div className="text-xs text-gray-600">{new Date(detailNote.createdAt).toLocaleString("vi-VN")}</div>
                </div>
                {currentUserEmail && detailNote.createdByEmail.toLowerCase() === currentUserEmail.toLowerCase() && (
                  <div className="flex gap-2 pr-8">
                    <Button
                      variant="outline"
                      className="bg-[#257180] text-white hover:bg-[#1e5a66] border-[#257180] px-4 shadow-sm"
                      onClick={() => {
                        setDetailNote(null);
                        setFakeNotes(prev =>
                          prev.map(n => n.id === detailNote.id ? { ...n, content: n.content + "\n- (Updated)" } : n)
                        );
                      }}
                    >
                      Cập nhật
                    </Button>
                    <Button
                      variant="outline"
                      className="border-red-200 text-red-500"
                      onClick={() => {
                        setDetailNote(null);
                        handleDeleteFake(detailNote.id);
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
                  {detailNote.media.map((m) =>
                    m.mediaType === 0 ? (
                      <img
                        key={m.id}
                        src={m.fileUrl}
                        alt="img"
                        className="w-48 h-48 object-cover rounded-xl border border-[#257180]/20 shadow-sm cursor-pointer"
                        onClick={() =>
                          setPreviewMedia({
                            url: m.fileUrl,
                            type: "image",
                            name: renderFileName(m.fileUrl),
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
                            type: "video",
                            name: renderFileName(m.fileUrl),
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

      <Dialog open={!!previewMedia} onOpenChange={(open) => !open && setPreviewMedia(null)}>
        <DialogContent className="max-w-6xl p-0 overflow-hidden bg-white rounded-2xl border border-[#257180]/20 shadow-2xl">
          <div className="bg-white">
            {previewMedia?.name && (
              <div className="px-4 py-3 text-sm font-semibold text-gray-900 border-b border-gray-200">
                {previewMedia.name}
              </div>
            )}
            {previewMedia?.type === "image" ? (
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
    </PageWrapper>
  );
}


