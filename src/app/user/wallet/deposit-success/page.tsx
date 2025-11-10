"use client";

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageWrapper } from '@/components/common/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/layout/card';
import { Button } from '@/components/ui/basic/button';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { WalletService } from '@/services/walletService';
import { useWallet } from '@/hooks/useWallet';
import { useCustomToast } from '@/hooks/useCustomToast';

function DepositSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refetch } = useWallet();
  const { showSuccess, showError } = useCustomToast();

  useEffect(() => {
    const handleCallback = async () => {
      // Get VNPay response parameters
      const vnpResponseCode = searchParams?.get('vnp_ResponseCode');
      const vnpTransactionStatus = searchParams?.get('vnp_TransactionStatus');
      const vnpAmount = searchParams?.get('vnp_Amount');
      const vnpTxnRef = searchParams?.get('vnp_TxnRef');
      const vnpOrderInfo = searchParams?.get('vnp_OrderInfo');

      // VNPay response codes:
      // ResponseCode: "00" = Success, "24" = Cancelled, others = Failed
      // TransactionStatus: "00" = Success, "02" = Failed/Cancelled

      if (vnpResponseCode === '00' && vnpTransactionStatus === '00') {
        // Payment successful
        const amount = vnpAmount ? parseInt(vnpAmount) / 100 : 0;
        showSuccess(
          'Thanh toán thành công',
          `Bạn đã nạp ${WalletService.formatCurrency(amount)} vào ví thành công.`
        );
        
        // Refresh wallet balance
        await refetch();
        
        // Redirect to wallet tab after 2 seconds
        setTimeout(() => {
          router.push('/profile?tab=wallet');
        }, 2000);
      } else if (vnpResponseCode === '24' || vnpTransactionStatus === '02') {
        // Payment cancelled by user
        showError(
          'Giao dịch đã bị hủy',
          'Bạn đã hủy giao dịch nạp tiền. Vui lòng thử lại nếu muốn tiếp tục.'
        );
        
        // Redirect to wallet tab after 2 seconds
        setTimeout(() => {
          router.push('/profile?tab=wallet');
        }, 2000);
      } else {
        // Payment failed
        showError(
          'Thanh toán thất bại',
          'Giao dịch không thành công. Vui lòng thử lại hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục.'
        );
        
        // Redirect to wallet tab after 2 seconds
        setTimeout(() => {
          router.push('/profile?tab=wallet');
        }, 2000);
      }
    };

    if (searchParams) {
      handleCallback();
    }
  }, [searchParams, router, refetch, showSuccess, showError]);

  const vnpResponseCode = searchParams?.get('vnp_ResponseCode');
  const vnpTransactionStatus = searchParams?.get('vnp_TransactionStatus');
  const vnpAmount = searchParams?.get('vnp_Amount');
  const isSuccess = vnpResponseCode === '00' && vnpTransactionStatus === '00';
  const isCancelled = vnpResponseCode === '24' || vnpTransactionStatus === '02';
  const amount = vnpAmount ? parseInt(vnpAmount) / 100 : 0;

  return (
    <PageWrapper currentPage="profile">
      <div className="min-h-screen bg-gray-50 pt-16 pb-8">
        <div className="max-w-2xl mx-auto px-4">
          <Card className="border-[#FD8B51]">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                {isSuccess ? (
                  <CheckCircle className="h-16 w-16 text-green-600" />
                ) : isCancelled ? (
                  <XCircle className="h-16 w-16 text-yellow-600" />
                ) : (
                  <XCircle className="h-16 w-16 text-red-600" />
                )}
              </div>
              <CardTitle className="text-2xl">
                {isSuccess
                  ? 'Nạp tiền thành công'
                  : isCancelled
                  ? 'Giao dịch đã bị hủy'
                  : 'Thanh toán thất bại'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isSuccess && (
                <div className="text-center space-y-2">
                  <p className="text-gray-600">
                    Bạn đã nạp <strong className="text-[#257180]">{WalletService.formatCurrency(amount)}</strong> vào ví thành công.
                  </p>
                  <p className="text-sm text-gray-500">
                    Số tiền đã được cập nhật vào tài khoản của bạn.
                  </p>
                </div>
              )}

              {isCancelled && (
                <div className="text-center space-y-2">
                  <p className="text-gray-600">
                    Bạn đã hủy giao dịch nạp tiền.
                  </p>
                  <p className="text-sm text-gray-500">
                    Số tiền chưa được trừ khỏi tài khoản của bạn.
                  </p>
                </div>
              )}

              {!isSuccess && !isCancelled && (
                <div className="text-center space-y-2">
                  <p className="text-gray-600">
                    Giao dịch không thành công.
                  </p>
                  <p className="text-sm text-gray-500">
                    Vui lòng thử lại hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục.
                  </p>
                </div>
              )}

              <div className="flex justify-center gap-4 pt-4">
                <Button
                  onClick={() => router.push('/profile?tab=wallet')}
                  className="bg-[#257180] hover:bg-[#257180]/90 text-white"
                >
                  Quay về ví
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/')}
                  className="border-[#257180] text-[#257180] hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]"
                >
                  Về trang chủ
                </Button>
              </div>

              <div className="text-center pt-4">
                <p className="text-xs text-gray-400">
                  Đang chuyển hướng về trang ví...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}

export default function DepositSuccessPage() {
  return (
    <Suspense
      fallback={
        <PageWrapper currentPage="profile">
          <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Đang xử lý...</span>
            </div>
          </div>
        </PageWrapper>
      }
    >
      <DepositSuccessContent />
    </Suspense>
  );
}

