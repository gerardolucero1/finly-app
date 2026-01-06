export const API_BASE_URL = 'https://holafinly.com/api';
// export const API_BASE_URL = 'http://192.168.1.134:8000/api';
// export const API_BASE_URL = 'http://192.168.1.92:80/api';
export const WEB_BASE_URL = API_BASE_URL.replace(/\/api$/, '');

// Google OAuth Client IDs
// WEB: Para desarrollo en Expo Go (usa flujo web)
export const GOOGLE_WEB_CLIENT_ID = '356916697234-fs7lf77chcocg0n2u5d9blsbft0pj07p.apps.googleusercontent.com';
// ANDROID: Para APK de producción (usa SHA-1 del keystore)
export const GOOGLE_ANDROID_CLIENT_ID = '356916697234-5hco08jfgc84ekkclf868d63geiq5i26.apps.googleusercontent.com';

export const API_ENDPOINTS = {
    LOGIN: '/login',
    LOGIN_GOOGLE: '/auth/google',
    LOGOUT: '/logout',
    REGISTER: '/register',
    ME: '/me',
    DASHBOARD: '/dashboard',
    ACCOUNTS: '/accounts',
    REORDER_ACCOUNTS: '/accounts/reorder',
    SAVINGS: '/savings',
    SUBACCOUNTS: '/sub-accounts',
    CATEGORIES: '/expenses/categories',
    EXPENSES: '/expenses',
    INCOMES: '/incomes',
    DEBTS: '/debts',
    DEBT_PAYMENTS: '/debt-payment',
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
    BUDGETS: '/budgets',
    PROJECTS: '/projects',
    TICKET: '/support/ticket',

};

export const getAuthHeader = (token: string) => ({
    headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    },
});