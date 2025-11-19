import { API_ENDPOINTS } from '../constants/api';
import api from './apiClient';

export const SubscriptionService = {
    async subscribe(price_id: String): Promise<any> {
        const { data } = await api.post(API_ENDPOINTS.SUBSCRIPTION, { price_id });
        return data;
    },

    async confirmSubscription(subscription: Partial<any>): Promise<any> {
        const { data } = await api.post(API_ENDPOINTS.CONFIRM_SUBSCRIPTION, subscription);
        return data;
    },

    async resumeSubscription(): Promise<any> {
        const { data } = await api.post(API_ENDPOINTS.RESUME_SUBSCRIPTION);
        return data;
    },

    async cancelSubscription(): Promise<any> {
        const { data } = await api.post(API_ENDPOINTS.CANCEL_SUBSCRIPTION);
        return data;
    },

    async updateSubscription(price_id: String): Promise<any> {
        const { data } = await api.post(API_ENDPOINTS.UPDATE_SUBSCRIPTION, { price_id });
        return data;
    },
};