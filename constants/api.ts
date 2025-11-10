// export const API_BASE_URL = 'http://finance.test/api';
export const API_BASE_URL = 'http://192.168.8.18:8000/api';

export const API_ENDPOINTS = {
    LOGIN: '/login',
    REGISTER: '/register',
    ME: '/me',
    ACCOUNTS: '/accounts',
    CATEGORIES: '/expenses/categories',
    EXPENSES: '/expenses',
};

export const getAuthHeader = (token: string) => ({
    headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    },
});