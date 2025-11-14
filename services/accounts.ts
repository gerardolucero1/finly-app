import { Account } from '@/models/account';
import { PaginatedResponse } from '@/models/paginated_response';
import { API_ENDPOINTS } from '../constants/api';
import api from './apiClient';

export const AccountsService = {
    async getAll(page = 1): Promise<PaginatedResponse<Account>> {
        const { data } = await api.get(`${API_ENDPOINTS.ACCOUNTS}?page=${page}`);
        return data;
    },

    async create(account: Partial<any>) {
        const { data } = await api.post(API_ENDPOINTS.ACCOUNTS, account);
        return data;
    },

    async update(id: number, account: Partial<any>) {
        const { data } = await api.put(`${API_ENDPOINTS.ACCOUNTS}/${id}`, account);
        return data;
    },

    async delete(id: number) {
        await api.delete(`${API_ENDPOINTS.ACCOUNTS}/${id}`);
    },

    async transfer(id: number, transfer: Partial<any>) {
        const { data } = await api.post(`${API_ENDPOINTS.ACCOUNTS}/${id}/transfer`, transfer);
        return data;
    },
};