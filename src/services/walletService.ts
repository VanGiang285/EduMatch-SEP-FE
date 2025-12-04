import { apiClient, replaceUrlParams } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import { ApiResponse } from '@/types/api';
import { WalletDto, WalletTransactionDto, WithdrawalDto, UserBankAccountDto, BankDto, WalletTransactionType, WalletTransactionReason, WalletTransactionStatus, WithdrawalStatus, SystemWalletDashboardDto } from '@/types/backend';
import { CreateDepositRequest, CreateWithdrawalRequest, CreateUserBankAccountRequest } from '@/types/requests';

export class WalletService {
  // Lấy số dư ví của user hiện tại
  static async getWalletBalance(): Promise<ApiResponse<WalletDto>> {
    return apiClient.get<WalletDto>(API_ENDPOINTS.WALLET.GET_BALANCE);
  }

  // Lấy lịch sử giao dịch ví
  static async getTransactions(): Promise<ApiResponse<WalletTransactionDto[]>> {
    return apiClient.get<WalletTransactionDto[]>(API_ENDPOINTS.WALLET.GET_TRANSACTIONS);
  }

  // Tạo yêu cầu nạp tiền qua VNPay
  // Response trả về paymentUrl (string) để redirect user đến trang thanh toán VNPay
  static async createDeposit(request: CreateDepositRequest): Promise<ApiResponse<string>> {
    return apiClient.post<string>(API_ENDPOINTS.WALLET.CREATE_DEPOSIT_VNPAY, request);
  }

  // Hủy yêu cầu nạp tiền
  static async cancelDeposit(depositId: number): Promise<ApiResponse<void>> {
    const url = replaceUrlParams(API_ENDPOINTS.WALLET.CANCEL_DEPOSIT, { id: depositId.toString() });
    return apiClient.post<void>(url);
  }

  // Dọn dẹp các yêu cầu nạp đã hết hạn (admin)
  static async cleanupExpiredDeposits(): Promise<ApiResponse<string>> {
    return apiClient.post<string>(API_ENDPOINTS.WALLET.CLEANUP_EXPIRED_DEPOSITS);
  }

  // Tạo yêu cầu rút tiền
  // Response trả về message (string) thông báo thành công
  static async createWithdrawal(request: CreateWithdrawalRequest): Promise<ApiResponse<string>> {
    return apiClient.post<string>(API_ENDPOINTS.WALLET.CREATE_WITHDRAWAL, request);
  }

  // Lấy ví hệ thống (admin)
  static async getSystemWallet(): Promise<ApiResponse<WalletDto>> {
    return apiClient.get<WalletDto>(API_ENDPOINTS.ADMIN_WALLET.GET_SYSTEM_WALLET);
  }

  // Lấy lịch sử giao dịch của ví hệ thống (admin)
  static async getSystemWalletTransactions(): Promise<ApiResponse<WalletTransactionDto[]>> {
    return apiClient.get<WalletTransactionDto[]>(API_ENDPOINTS.ADMIN_WALLET.GET_SYSTEM_TRANSACTIONS);
  }

  // Lấy dữ liệu dashboard ví hệ thống (admin)
  static async getSystemWalletDashboard(): Promise<ApiResponse<SystemWalletDashboardDto>> {
    return apiClient.get<SystemWalletDashboardDto>(API_ENDPOINTS.ADMIN_WALLET.GET_DASHBOARD);
  }

  static normalizeTransactionType(type: number | string): WalletTransactionType {
    if (typeof type === 'number') {
      return type as WalletTransactionType;
    }

    switch (type.toLowerCase()) {
      case 'credit':
        return WalletTransactionType.CREDIT;
      case 'debit':
        return WalletTransactionType.DEBIT;
      default:
        return WalletTransactionType.DEBIT;
    }
  }

  static normalizeTransactionReason(reason: number | string): WalletTransactionReason {
    if (typeof reason === 'number') {
      return reason as WalletTransactionReason;
    }

    switch (reason.toLowerCase()) {
      case 'deposit':
        return WalletTransactionReason.DEPOSIT;
      case 'withdrawal':
        return WalletTransactionReason.WITHDRAWAL;
      case 'bookingpayment':
      case 'payment_booking':
        return WalletTransactionReason.PAYMENT_BOOKING;
      case 'bookingrefund':
      case 'refund_booking':
        return WalletTransactionReason.REFUND_BOOKING;
      case 'bookingpayout':
      case 'receive_from_booking':
      case 'bookingpayouts':
        return WalletTransactionReason.RECEIVE_FROM_BOOKING;
      case 'platformfee':
      case 'platform_fee':
        return WalletTransactionReason.PLATFORM_FEE;
      default:
        return WalletTransactionReason.DEPOSIT;
    }
  }

  static normalizeTransactionStatus(status: number | string): WalletTransactionStatus {
    if (typeof status === 'number') {
      return status as WalletTransactionStatus;
    }

    switch (status.toLowerCase()) {
      case 'completed':
        return WalletTransactionStatus.COMPLETED;
      case 'failed':
        return WalletTransactionStatus.FAILED;
      case 'pending':
      default:
        return WalletTransactionStatus.PENDING;
    }
  }

  static normalizeWithdrawalStatus(status: number | string): WithdrawalStatus {
    if (typeof status === 'number') {
      return status as WithdrawalStatus;
    }

    switch (status.toLowerCase()) {
      case 'approved':
      case 'processing':
        return WithdrawalStatus.APPROVED;
      case 'rejected':
        return WithdrawalStatus.REJECTED;
      case 'completed':
        return WithdrawalStatus.COMPLETED;
      case 'failed':
        return WithdrawalStatus.FAILED;
      case 'pending':
      default:
        return WithdrawalStatus.PENDING;
    }
  }

  // Lấy danh sách yêu cầu rút tiền của user hiện tại
  static async getMyWithdrawals(): Promise<ApiResponse<WithdrawalDto[]>> {
    return apiClient.get<WithdrawalDto[]>(API_ENDPOINTS.WALLET.GET_MY_WITHDRAWALS);
  }

  // Lấy danh sách ngân hàng
  static async getAllBanks(): Promise<ApiResponse<BankDto[]>> {
    return apiClient.get<BankDto[]>(API_ENDPOINTS.WALLET.GET_BANKS);
  }

  // Lấy danh sách tài khoản ngân hàng
  static async getBankAccounts(): Promise<ApiResponse<UserBankAccountDto[]>> {
    return apiClient.get<UserBankAccountDto[]>(API_ENDPOINTS.WALLET.GET_BANK_ACCOUNTS);
  }

  // Thêm tài khoản ngân hàng
  static async createBankAccount(request: CreateUserBankAccountRequest): Promise<ApiResponse<UserBankAccountDto>> {
    return apiClient.post<UserBankAccountDto>(API_ENDPOINTS.WALLET.CREATE_BANK_ACCOUNT, request);
  }

  // Xóa tài khoản ngân hàng
  static async deleteBankAccount(id: number): Promise<ApiResponse<void>> {
    const url = replaceUrlParams(API_ENDPOINTS.WALLET.DELETE_BANK_ACCOUNT, { id: id.toString() });
    return apiClient.delete<void>(url);
  }

  // Format số tiền sang VND
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  }

  // Lấy label loại giao dịch
  static getTransactionTypeLabel(type: number | string): string {
    const normalizedType = WalletService.normalizeTransactionType(type);
    const labels: Record<number, string> = {
      [WalletTransactionType.DEBIT]: 'Rút tiền',
      [WalletTransactionType.CREDIT]: 'Nạp tiền',
    };
    return labels[normalizedType] || 'Không xác định';
  }

  // Lấy label lý do giao dịch
  static getTransactionReasonLabel(reason: number | string): string {
    const normalizedReason = WalletService.normalizeTransactionReason(reason);
    const labels: Record<number, string> = {
      [WalletTransactionReason.DEPOSIT]: 'Nạp tiền',
      [WalletTransactionReason.WITHDRAWAL]: 'Rút tiền',
      [WalletTransactionReason.PAYMENT_BOOKING]: 'Thanh toán booking',
      [WalletTransactionReason.REFUND_BOOKING]: 'Hoàn tiền booking',
      [WalletTransactionReason.RECEIVE_FROM_BOOKING]: 'Nhận tiền từ booking',
      [WalletTransactionReason.PLATFORM_FEE]: 'Phí nền tảng',
    };
    return labels[normalizedReason] || 'Không xác định';
  }

  // Lấy label trạng thái rút tiền
  static getWithdrawalStatusLabel(status: number | string): string {
    const normalizedStatus = WalletService.normalizeWithdrawalStatus(status);
    const labels: Record<number, string> = {
      [WithdrawalStatus.PENDING]: 'Chờ duyệt',
      [WithdrawalStatus.APPROVED]: 'Đã duyệt (Đang xử lý)',
      [WithdrawalStatus.REJECTED]: 'Bị từ chối',
      [WithdrawalStatus.COMPLETED]: 'Hoàn thành',
      [WithdrawalStatus.FAILED]: 'Thất bại'
    };
    return labels[normalizedStatus] || 'Không xác định';
  }
}
