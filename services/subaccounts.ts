import { Account } from '@/models/account';
import { API_ENDPOINTS } from '../constants/api';
import api from './apiClient';

export const SubaccountsService = {
    async getAll(): Promise<Account> {
        const { data } = await api.get(API_ENDPOINTS.SUBACCOUNTS);
        return data;
    },

    async create(account: Partial<any>) {
        const { data } = await api.post(API_ENDPOINTS.SUBACCOUNTS, account);
        return data;
    },

    async update(id: number, account: Partial<any>) {
        const { data } = await api.put(`${API_ENDPOINTS.SUBACCOUNTS}/${id}`, account);
        return data;
    },

    async delete(id: number) {
        await api.delete(`${API_ENDPOINTS.SUBACCOUNTS}/${id}`);
    },
};