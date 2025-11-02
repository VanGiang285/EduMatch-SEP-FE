import { apiClient, replaceUrlParams } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants';
import { ApiResponse } from '@/types/api';
import { WalletDto, WalletTransactionDto, DepositDto, WithdrawalDto, UserBankAccountDto } from '@/types/backend';
import { CreateDepositRequest, CreateWithdrawalRequest, CreateUserBankAccountRequest, ProcessWithdrawalRequest } from '@/types/requests';

export class WalletService {
  // Lấy số dư ví của user hiện tại
  static async getWalletBalance(): Promise<ApiResponse<WalletDto>> {
    return apiClient.get<WalletDto>(API_ENDPOINTS.WALLET.GET_BALANCE);
  }

  // Lấy lịch sử giao dịch ví
  static async getTransactions(): Promise<ApiResponse<WalletTransactionDto[]>> {
    return apiClient.get<WalletTransactionDto[]>(API_ENDPOINTS.WALLET.GET_TRANSACTIONS);
  }

  // Tạo yêu cầu nạp tiền (PayOS/MoMo/VNPay)
  static async createDeposit(request: CreateDepositRequest): Promise<ApiResponse<DepositDto>> {
    return apiClient.post<DepositDto>(API_ENDPOINTS.WALLET.CREATE_DEPOSIT, request);
  }

  // Tạo yêu cầu rút tiền
  static async createWithdrawal(request: CreateWithdrawalRequest): Promise<ApiResponse<WithdrawalDto>> {
    return apiClient.post<WithdrawalDto>(API_ENDPOINTS.WALLET.CREATE_WITHDRAWAL, request);
  }

  // Lấy danh sách yêu cầu rút tiền (admin)
  static async getWithdrawals(): Promise<ApiResponse<WithdrawalDto[]>> {
    return apiClient.get<WithdrawalDto[]>(API_ENDPOINTS.WALLET.GET_WITHDRAWALS);
  }

  // Xử lý yêu cầu rút tiền (admin duyệt/từ chối)
  static async processWithdrawal(withdrawalId: number, request: ProcessWithdrawalRequest): Promise<ApiResponse<WithdrawalDto>> {
    const url = replaceUrlParams(API_ENDPOINTS.WALLET.PROCESS_WITHDRAWAL, { withdrawalId: withdrawalId.toString() });
    return apiClient.put<WithdrawalDto>(url, request);
  }

  // Lấy danh sách tài khoản ngân hàng
  static async getBankAccounts(): Promise<ApiResponse<UserBankAccountDto[]>> {
    return apiClient.get<UserBankAccountDto[]>(API_ENDPOINTS.WALLET.GET_BANK_ACCOUNTS);
  }

  // Thêm tài khoản ngân hàng
  static async createBankAccount(request: CreateUserBankAccountRequest): Promise<ApiResponse<UserBankAccountDto>> {
    return apiClient.post<UserBankAccountDto>(API_ENDPOINTS.WALLET.CREATE_BANK_ACCOUNT, request);
  }

  // Cập nhật tài khoản ngân hàng
  static async updateBankAccount(id: number, request: Partial<CreateUserBankAccountRequest>): Promise<ApiResponse<UserBankAccountDto>> {
    const url = replaceUrlParams(API_ENDPOINTS.WALLET.UPDATE_BANK_ACCOUNT, { id: id.toString() });
    return apiClient.put<UserBankAccountDto>(url, request);
  }

  // Xóa tài khoản ngân hàng
  static async deleteBankAccount(id: number): Promise<ApiResponse<void>> {
    const url = replaceUrlParams(API_ENDPOINTS.WALLET.DELETE_BANK_ACCOUNT, { id: id.toString() });
    return apiClient.delete<void>(url);
  }

  // Đặt tài khoản ngân hàng làm mặc định
  static async setDefaultBankAccount(id: number): Promise<ApiResponse<UserBankAccountDto>> {
    const url = replaceUrlParams(API_ENDPOINTS.WALLET.SET_DEFAULT_BANK_ACCOUNT, { id: id.toString() });
    return apiClient.put<UserBankAccountDto>(url);
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
