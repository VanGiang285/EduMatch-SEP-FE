import { apiClient, replaceUrlParams } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import { ApiResponse } from '@/types/api';
import { WalletDto, WalletTransactionDto, WithdrawalDto, UserBankAccountDto, BankDto } from '@/types/backend';
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

  // Tạo yêu cầu rút tiền
  // Response trả về message (string) thông báo thành công
  static async createWithdrawal(request: CreateWithdrawalRequest): Promise<ApiResponse<string>> {
    return apiClient.post<string>(API_ENDPOINTS.WALLET.CREATE_WITHDRAWAL, request);
  }

  // Lấy danh sách yêu cầu rút tiền của user hiện tại
  static async getMyWithdrawals(): Promise<ApiResponse<WithdrawalDto[]>> {
    return apiClient.get<WithdrawalDto[]>(API_ENDPOINTS.WALLET.GET_MY_WITHDRAWALS);
  }

  // Lấy danh sách yêu cầu rút tiền đang chờ duyệt (admin)
  static async getPendingWithdrawals(): Promise<ApiResponse<WithdrawalDto[]>> {
    return apiClient.get<WithdrawalDto[]>(API_ENDPOINTS.WALLET.GET_PENDING_WITHDRAWALS);
  }

  // Duyệt yêu cầu rút tiền (admin)
  // Response trả về message (string) thông báo thành công
  static async approveWithdrawal(withdrawalId: number): Promise<ApiResponse<string>> {
    const url = replaceUrlParams(API_ENDPOINTS.WALLET.APPROVE_WITHDRAWAL, { id: withdrawalId.toString() });
    return apiClient.post<string>(url);
  }

  // Từ chối yêu cầu rút tiền (admin)
  // Cần gửi body với { Reason: string }
  static async rejectWithdrawal(withdrawalId: number, rejectReason: string): Promise<ApiResponse<string>> {
    const url = replaceUrlParams(API_ENDPOINTS.WALLET.REJECT_WITHDRAWAL, { id: withdrawalId.toString() });
    return apiClient.post<string>(url, { Reason: rejectReason });
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
  static getTransactionTypeLabel(type: number): string {
    const labels: Record<number, string> = { 0: 'Rút tiền', 1: 'Nạp tiền' };
    return labels[type] || 'Không xác định';
  }

  // Lấy label lý do giao dịch
  static getTransactionReasonLabel(reason: number): string {
    const labels: Record<number, string> = {
      0: 'Nạp tiền', 1: 'Rút tiền', 2: 'Thanh toán booking',
      3: 'Hoàn tiền booking', 4: 'Nhận tiền từ booking', 5: 'Phí nền tảng'
    };
    return labels[reason] || 'Không xác định';
  }

  // Lấy label trạng thái rút tiền
  static getWithdrawalStatusLabel(status: number): string {
    const labels: Record<number, string> = {
      0: 'Chờ duyệt', 1: 'Đã duyệt (Đang xử lý)', 2: 'Bị từ chối', 3: 'Hoàn thành', 4: 'Thất bại'
    };
    return labels[status] || 'Không xác định';
  }
}
