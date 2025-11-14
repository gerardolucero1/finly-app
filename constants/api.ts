// export const API_BASE_URL = 'http://finance.test/api';
export const API_BASE_URL = 'http://192.168.1.135:8000/api';

export const API_ENDPOINTS = {
    LOGIN: '/login',
    REGISTER: '/register',
    ME: '/me',
    DASHBOARD: '/dashboard',
    ACCOUNTS: '/accounts',
    CATEGORIES: '/expenses/categories',
    EXPENSES: '/expenses',
    INCOMES: '/incomes',
};

export const getAuthHeader = (token: string) => ({
    headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    },
});