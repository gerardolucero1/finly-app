export interface Transfer {
    id: number;
    user_id: number;
    from_account_id: number;
    to_account_id: number;
    amount: string;
    date: Date;
    description: null;
    created_at: Date;
    updated_at: Date;
    from_account: FromAccount;
}

export interface FromAccount {
    id: number;
    name: string;
    tags: any[];
}