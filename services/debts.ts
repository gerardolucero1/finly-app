import { Debt } from '@/models/debt';
import { PaginatedResponse } from '@/models/paginated_response';
import { API_ENDPOINTS } from '../constants/api';
import api from './apiClient';

export const DebtsService = {
    async getAll(page = 1): Promise<PaginatedResponse<Debt>> {
        const { data } = await api.get(`${API_ENDPOINTS.DEBTS}?page=${page}`);
        return data;
    },

    async create(debt: Partial<any>) {
        const { data } = await api.post(API_ENDPOINTS.DEBTS, debt);
        return data;
    },

    async update(id: number, debt: Partial<any>) {
        const { data } = await api.put(`${API_ENDPOINTS.DEBTS}/${id}`, debt);
        return data;
    },

    async delete(id: number) {
        await api.delete(`${API_ENDPOINTS.DEBTS}/${id}`);
    },

};