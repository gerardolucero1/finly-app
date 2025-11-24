import { Account } from '@/models/account';
import { PaginatedResponse } from '@/models/paginated_response';
import { Transfer } from '@/models/transfer';
import { API_ENDPOINTS } from '../constants/api';
import api from './apiClient';

export interface ChartDataPoint {
    label: string;
    raw_date: string;
    transfers_accumulated: number;
    interest_accumulated: number;
    total_growth: number;
}

export interface ChartSummary {
    month_transfers: number;
    month_interest: number;
}

export interface SavingsShowResponse {
    account: Account;
    transfers: PaginatedResponse<Transfer>;
    chart_data: ChartDataPoint[];
    summary: ChartSummary;
}

export const SavingsService = {
    async getAll(): Promise<Account> {
        const { data } = await api.get(API_ENDPOINTS.SAVINGS);
        return data;
    },

    async show(
        id: number,
        page: number = 1
    ): Promise<SavingsShowResponse> {
        const { data } = await api.get<SavingsShowResponse>(`${API_ENDPOINTS.SAVINGS}/${id}`, {
            params: { page }
        });

        return data;
    },

    async create(account: Partial<any>) {
        const { data } = await api.post(API_ENDPOINTS.SAVINGS, account);
        return data;
    },

    async update(id: number, account: Partial<any>) {
        const { data } = await api.put(`${API_ENDPOINTS.SAVINGS}/${id}`, account);
        return data;
    },

    async delete(id: number) {
        await api.delete(`${API_ENDPOINTS.SAVINGS}/${id}`);
    },

    async toggleCompound(id: number) {
        await api.post(`${API_ENDPOINTS.SAVINGS}/${id}/toggle-compound`);
    },
};