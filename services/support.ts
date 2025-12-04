import { API_ENDPOINTS } from '../constants/api';
import api from './apiClient';

export const SupportService = {
    async createTicket(message: Partial<any>) {
        const { data } = await api.post(API_ENDPOINTS.TICKET, message);
        return data;
    },
};