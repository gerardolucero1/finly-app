import { DebtPayment } from '@/models/debt_payment';
import { PaginatedResponse } from '@/models/paginated_response';
import { API_ENDPOINTS } from '../constants/api';
import api from './apiClient';

export const DebtPaymentsService = {
    async getAll(page = 1, debtId?: number): Promise<PaginatedResponse<DebtPayment>> {
        const { data } = await api.get(`${API_ENDPOINTS.DEBT_PAYMENTS}/${debtId}?page=${page}`);
        return data;
    },

    async create(debtPayment: Partial<any>, debtId?: number) {
        const { data } = await api.post(`${API_ENDPOINTS.DEBT_PAYMENTS}/${debtId}`, debtPayment);
        return data;
    },

    async update(id: number, debtPayment: Partial<any>) {
        const { data } = await api.put(`${API_ENDPOINTS.DEBT_PAYMENTS}/${id}`, debtPayment);
        return data;
    },

    async delete(id: number) {
        await api.delete(`${API_ENDPOINTS.DEBT_PAYMENTS}/${id}`);
    },

};