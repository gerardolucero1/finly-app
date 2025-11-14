import { Income } from '@/models/income';
import { PaginatedResponse } from '@/models/paginated_response';
import { API_ENDPOINTS } from '../constants/api';
import api from './apiClient';

export const IncomesService = {
    async getAll(page = 1, account_id?: number): Promise<PaginatedResponse<Income>> {
        const url = `${API_ENDPOINTS.INCOMES}?page=${page}${account_id ? `&account_id=${account_id}` : ''}`;
        const { data } = await api.get(url);
        return data;
    },

    async create(income: Partial<any>) {
        const { data } = await api.post(API_ENDPOINTS.INCOMES, income);
        return data;
    },

    async update(id: number, income: Partial<any>) {
        const { data } = await api.put(`${API_ENDPOINTS.INCOMES}/${id}`, income);
        return data;
    },

    async delete(id: number) {
        await api.delete(`${API_ENDPOINTS.INCOMES}/${id}`);
    },
};