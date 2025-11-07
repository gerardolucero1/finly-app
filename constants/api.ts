export const API_BASE_URL = 'http://finance.test/api';

export const API_ENDPOINTS = {
    LOGIN: '/login',
    REGISTER: '/register',
    ME: '/me',
    ACCOUNTS: '/accounts',
};

export const getAuthHeader = (token: string) => ({
    headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    },
});