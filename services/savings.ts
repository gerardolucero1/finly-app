import { Account } from '@/models/account';
import { API_ENDPOINTS } from '../constants/api';
import api from './apiClient';

export const SavingsService = {
    async getAll(): Promise<Account> {
        const { data } = await api.get(API_ENDPOINTS.SAVINGS);
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
};