import { Account } from '@/models/account';
import { Expense } from '@/models/expense';
import { PaginatedResponse } from '@/models/paginated_response';
import { API_ENDPOINTS } from '../constants/api';
import api from './apiClient';

export const ExpensesService = {
    async getAll(page = 1, account_id?: number): Promise<PaginatedResponse<Expense>> {
        const url = `${API_ENDPOINTS.EXPENSES}?page=${page}${account_id ? `&account_id=${account_id}` : ''}`;
        const { data } = await api.get(url);
        return data;
    },

    async create(expense: Partial<Account>) {
        const { data } = await api.post(API_ENDPOINTS.EXPENSES, expense);
        return data;
    },

    async update(id: number, expense: Partial<Account>) {
        const { data } = await api.put(`${API_ENDPOINTS.EXPENSES}/${id}`, expense);
        return data;
    },

    async delete(id: number) {
        await api.delete(`${API_ENDPOINTS.EXPENSES}/${id}`);
    },
};