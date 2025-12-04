export interface PlanFeatures {
    accounts_limit: number;
    budgets_limit: number;
    debts_limit: number;
    savings_limit: number;
    sub_accounts_limit: number;
    strategies_limit: number;
    whatsapp_bot: boolean;
    read_tickets: boolean;
    read_pdf: boolean;
    freelancer_mode: boolean;
    priority_support: boolean;
}

export const PLANS: Record<string, PlanFeatures> = {
    'free': {
        'accounts_limit': 1,
        'budgets_limit': 1,
        'debts_limit': 1,
        'savings_limit': 1,
        'sub_accounts_limit': 0,
        'strategies_limit': 0,
        'whatsapp_bot': false,
        'read_tickets': false,
        'read_pdf': false,
        'freelancer_mode': false,
        'priority_support': false,
    },

    'price_1SaKZD6dZB8Inoh78spRuotC': {
        'accounts_limit': -1,
        'budgets_limit': -1,
        'debts_limit': -1,
        'savings_limit': -1,
        'sub_accounts_limit': -1,
        'strategies_limit': 1,
        'whatsapp_bot': true,
        'read_tickets': false,
        'read_pdf': false,
        'freelancer_mode': false,
        'priority_support': false,
    },

    'price_1SaKZP6dZB8Inoh7hnph9Hdk': {
        'accounts_limit': -1,
        'budgets_limit': -1,
        'debts_limit': -1,
        'savings_limit': -1,
        'sub_accounts_limit': -1,
        'strategies_limit': -1,
        'whatsapp_bot': true,
        'read_tickets': true,
        'read_pdf': true,
        'freelancer_mode': true,
        'priority_support': true,
    },
};

export type FeatureKey = keyof PlanFeatures;
