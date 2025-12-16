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
    plan_name: string;
}

// Price IDs - Single source of truth
export const PRICE_IDS = {
    FREE: 'free_tier',
    PLUS: 'price_1Sf35C8U1HKbfQrJCupdRvXA',
    PRO: 'price_1Sf3578U1HKbfQrJNno8yuQa',
} as const;

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
        'plan_name': 'Free',
    },

    [PRICE_IDS.PLUS]: {
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
        'plan_name': 'Plus',
    },

    [PRICE_IDS.PRO]: {
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
        'plan_name': 'Pro',
    },
};

export type FeatureKey = keyof PlanFeatures;

// UI Display configuration for pricing cards
export interface PlanUIConfig {
    name: string;
    price: string;
    period: string;
    desc: string;
    features: string[];
    cta: string;
    popular: boolean;
    color: string;
    price_id: string;
    accentColor: string;
    icon: string;
}

export const PLANS_ARRAY: PlanUIConfig[] = [
    {
        name: 'Gratis',
        price: '0',
        period: '/siempre',
        desc: 'Para probar y organizar gastos básicos.',
        features: [
            'Registro Manual (Sin WhatsApp)',
            'Dashboard de Finanzas',
            'Límite: 1 Cuenta y 1 Presupuesto',
        ],
        cta: 'Gratis',
        popular: false,
        color: 'border-gray-200 dark:border-gray-700',
        price_id: PRICE_IDS.FREE,
        accentColor: '#64748B', // Slate 500
        icon: 'box',
    },
    {
        name: 'Plus',
        price: '49',
        period: '/mes',
        desc: 'La comodidad del Chatbot a precio de un café.',
        features: [
            'Todo lo del plan Gratis',
            'WhatsApp Bot: Registro Ilimitado (Texto)',
            'Cuentas y Presupuestos Ilimitados',
            'Alertas de Gastos en tiempo real',
            '1 Estrategia de Deuda con IA',
        ],
        cta: 'Obtener Plus',
        popular: false,
        color: 'border-blue-200 dark:border-blue-900',
        price_id: PRICE_IDS.PLUS,
        accentColor: '#3B82F6', // Blue 500
        icon: 'message-circle',
    },
    {
        name: 'Pro Freelancer',
        price: '149',
        period: '/mes',
        desc: 'Control total para tu negocio y vida personal.',
        features: [
            'Todo lo del plan Plus',
            'Modo Freelancer (Separa Negocio/Personal)',
            'IA: Lectura de Tickets (desde la App/Web)',
            'Estrategias de Deuda Ilimitadas',
            'Carga de PDF Bancarios (BBVA / Beta)',
        ],
        cta: 'Obtener Pro',
        popular: true,
        color: 'border-indigo-500 ring-2 ring-indigo-500 shadow-2xl',
        price_id: PRICE_IDS.PRO,
        accentColor: '#6366F1', // Indigo 500
        icon: 'briefcase',
    },
];
