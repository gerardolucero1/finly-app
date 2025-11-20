import { Notification } from '@/models/notification';
import { PaginatedResponse } from '@/models/paginated_response';
import { API_ENDPOINTS } from '../constants/api';
import api from './apiClient';

export const NotificationsService = {
    async getAll(page = 1): Promise<PaginatedResponse<Notification>> {
        const { data } = await api.get(`${API_ENDPOINTS.GET_NOTIFICATIONS}?page=${page}`);
        return data;
    },

    async markAsRead(id: number): Promise<void> {
        await api.post(`${API_ENDPOINTS.GET_NOTIFICATIONS}/${id}/read`);
    },

    async markAllAsRead(): Promise<void> {
        await api.post(`${API_ENDPOINTS.GET_NOTIFICATIONS}/mark-all-read`);
    },

    async delete(id: number): Promise<void> {
        await api.delete(`${API_ENDPOINTS.GET_NOTIFICATIONS}/${id}`);
    },

};