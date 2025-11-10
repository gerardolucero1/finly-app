import { Category } from '@/models/category';
import { SubCategory } from '@/models/subcategory';
import { API_ENDPOINTS } from '../constants/api';
import api from './apiClient';

export const CategoriesService = {
    async getAll(): Promise<{ categories: Category[]; subcategories: SubCategory[] }> {
        const { data } = await api.get(`${API_ENDPOINTS.CATEGORIES}`);
        return data;
    },
};