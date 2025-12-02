import { Project } from '@/models/project';
import { API_ENDPOINTS } from '../constants/api';
import api from './apiClient';

export const ProjectsService = {
    async getAll(): Promise<Project[]> {
        const url = `${API_ENDPOINTS.PROJECTS}`;
        const { data } = await api.get(url);
        return data;
    },

    async create(project: Partial<Project>) {
        const { data } = await api.post(API_ENDPOINTS.PROJECTS, project);
        return data;
    },

    async update(id: number, project: Partial<Project>) {
        const { data } = await api.post(`${API_ENDPOINTS.PROJECTS}/${id}`, project);
        return data;
    },

    async delete(id: number) {
        await api.delete(`${API_ENDPOINTS.PROJECTS}/${id}`);
    },
};