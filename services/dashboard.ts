import { API_ENDPOINTS } from '../constants/api';
import api from './apiClient';

export const DashboardService = {
    async getAll(): Promise<any> {
        const { data } = await api.get(API_ENDPOINTS.DASHBOARD);
        return data;
    },
};