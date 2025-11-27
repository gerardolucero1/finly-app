import { PaginatedResponse } from '@/models/paginated_response';
import { Transaction } from '@/models/transaction';
import { API_ENDPOINTS } from '../constants/api';
import api from './apiClient';

export interface TransactionFilters {
    search?: string;
    register_type?: 'income' | 'expense';
    account_id?: number;
    category_id?: number;
    sub_category_id?: number;
    start_date?: string; // YYYY-MM-DD
    end_date?: string;   // YYYY-MM-DD
}

export const TransactionsService = {
    async getAll(page = 1, filters: TransactionFilters = {}): Promise<PaginatedResponse<Transaction>> {
        const params = new URLSearchParams({ page: page.toString() });

        if (filters.search) params.append('search', filters.search);
        if (filters.register_type) params.append('register_type', filters.register_type);
        if (filters.account_id) params.append('account_id', filters.account_id.toString());
        if (filters.category_id) params.append('category_id', filters.category_id.toString());
        if (filters.sub_category_id) params.append('sub_category_id', filters.sub_category_id.toString());
        if (filters.start_date) params.append('start_date', filters.start_date);
        if (filters.end_date) params.append('end_date', filters.end_date);

        const url = `${API_ENDPOINTS.TRANSACTIONS}?${params.toString()}`;
        const { data } = await api.get(url);
        return data;
    }
};