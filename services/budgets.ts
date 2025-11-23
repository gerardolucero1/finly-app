import { Budget } from '@/models/budget';
import { API_ENDPOINTS } from '../constants/api';
import api from './apiClient';

export const BudgetsService = {
    async getAll(): Promise<Budget[]> {
        const { data } = await api.get(API_ENDPOINTS.BUDGETS);
        return data;
    },

    async create(budget: Partial<any>) {
        const { data } = await api.post(API_ENDPOINTS.BUDGETS, budget);
        return data;
    },

    async update(id: number, budget: Partial<any>) {
        const { data } = await api.put(`${API_ENDPOINTS.BUDGETS}/${id}`, budget);
        return data;
    },

    async delete(id: number) {
        await api.delete(`${API_ENDPOINTS.BUDGETS}/${id}`);
    },

};