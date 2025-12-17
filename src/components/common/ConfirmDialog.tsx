"use client";
import { ReactNode } from 'react';
import { Button } from '@/components/ui/basic/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/feedback/dialog';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';
export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  type?: 'info' | 'warning' | 'success' | 'error';
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  loading?: boolean;
  children?: ReactNode;
}
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  type = 'warning',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  onConfirm,
  onCancel,
  loading = false,
  children
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
  };
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      onOpenChange(false);
    }
  };
  const getIcon = () => {
    switch (type) {
      case 'info':
        return <Info className="h-6 w-6 text-[#257180]" />;
      case 'warning':
        return <AlertTriangle className="h-6 w-6 text-[#FD8B51]" />;
      case 'success':
        return <CheckCircle className="h-6 w-6 text-[#257180]" />;
      case 'error':
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <AlertTriangle className="h-6 w-6 text-[#FD8B51]" />;
    }
  };
  const getConfirmButtonVariant = () => {
    switch (type) {
      case 'error':
        return 'destructive' as const;
      case 'success':
        return 'default' as const;
      default:
        return 'default' as const;
    }
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            {getIcon()}
            <DialogTitle className="text-lg font-semibold">
              {title}
            </DialogTitle>
          </div>
          {description && (
            <DialogDescription className="text-sm text-gray-600 mt-2">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        {children && (
          <div className="py-4">
            {children}
          </div>
        )}
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
            className="border-gray-300 bg-white hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
          >
            {cancelText}
          </Button>
          <Button
            variant={getConfirmButtonVariant()}
            onClick={handleConfirm}
            disabled={loading}
            className={
              type === 'error'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-[#257180] hover:bg-[#1f5a66] text-white'
            }
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang xử lý...
              </>
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
