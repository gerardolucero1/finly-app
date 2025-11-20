export interface Debt {
    id: number;
    user_id: number;
    account_id: null;
    name: string;
    type: string;
    total_amount: string;
    initial_payment: string;
    remaining_amount: string;
    interest_rate: string;
    fixed_payment: number;
    debt_payment: string;
    minimum_payment: null;
    late_fee: null;
    payments_made: number;
    due_day: number;
    next_payment_date: Date;
    total_interest_paid: string;
    is_paid_off: number;
    notes: string;
    start_date: Date;
    end_date: null;
    frequency: string;
    total_payments_projected: number;
    remaining_payments: number;
    progress_percentage: string;
    amortization_schedule: AmortizationSchedule[];
    created_at: Date;
    updated_at: Date;
    payments_count: number;
    account: null;
}

export interface AmortizationSchedule {
    balance: number;
    payment: number;
    interest: number;
    principal: number;
    payment_number: number;
    total_interest_paid: number;
    total_principal_paid: number;
}
