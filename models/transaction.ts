export interface Transaction {
    id: number;
    amount: number;
    account_id: number | null;
    name: string;
    type: string;
    register_type: "expense" | "income";
    description: string;
    category: string;
    category_id: number | null;
    sub_category: string;
    sub_category_id: number | null;
    date: Date;
}