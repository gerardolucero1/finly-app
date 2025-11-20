// export const API_BASE_URL = 'http://finance.test/api';
export const API_BASE_URL = 'http://192.168.1.92:80/api';

export const API_ENDPOINTS = {
    LOGIN: '/login',
    LOGOUT: '/logout',
    REGISTER: '/register',
    ME: '/me',
    DASHBOARD: '/dashboard',
    ACCOUNTS: '/accounts',
    CATEGORIES: '/expenses/categories',
    EXPENSES: '/expenses',
    INCOMES: '/incomes',
    TRANSACTIONS: '/transactions',
    PROFILE: '/profile',
    UPDATE_PICTURE: '/profile/update-picture',
    DELETE_ACCOUNT: '/profile/delete-account',
    UPDATE_PASSWORD: '/profile/update-password',
    SUBSCRIPTION: '/subscription/subscribe',
    SUBSCRIPTION_PORTAL: '/subscription/portal',
    CANCEL_SUBSCRIPTION: '/subscription/cancel',
    RESUME_SUBSCRIPTION: '/subscription/resume',
    UPDATE_SUBSCRIPTION: '/subscription/update',
    RESTART_TRIAL: '/subscription/restart-trial',
    CONFIRM_SUBSCRIPTION: '/subscription/confirm',
    GET_SUBSCRIPTION: '/subscription',
    GET_NOTIFICATIONS: '/notifications',

};

export const getAuthHeader = (token: string) => ({
    headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    },
});