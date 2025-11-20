export interface DebtPayment {
    id: number;
    debt_id: number;
    account_id: number;
    amount: string;
    paid_at: Date;
    interest_amount: string;
    principal_amount: string;
    notes: null;
    is_extra_payment: number;
    created_at: Date;
    updated_at: Date;
}