export interface Transaction {
    id: number;
    amount: number;
    name: string,
    type: "expense" | "income";
    description: string;
    category: string;
    sub_category: string;
    date: Date;
}