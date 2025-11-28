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

    async create(expense: FormData | Partial<Expense>) {
        const { data } = await api.post(API_ENDPOINTS.EXPENSES, expense, {
            headers: {
                'Content-Type': 'multipart/form-data', // Importante para la subida
            },
        });
        return data;
    },

    async update(id: number, expense: FormData | Partial<Expense>) {
        // NOTA IMPORTANTE: Para subir archivos en Laravel al editar,
        // DEBES usar POST y no PUT. El verbo PUT se simula dentro del FormData.
        const { data } = await api.post(`${API_ENDPOINTS.EXPENSES}/${id}`, expense, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return data;
    },

    async delete(id: number) {
        await api.delete(`${API_ENDPOINTS.EXPENSES}/${id}`);
    },
};