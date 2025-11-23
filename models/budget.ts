import { Category } from "./category";
import { SubCategory } from "./subcategory";

export interface Budget {
    id: number;
    user_id: number;
    category_id: number;
    sub_category_id: number;
    name: string;
    amount: string;
    period: string;
    is_recurring: number;
    start_date: Date;
    end_date: Date;
    alerts_enabled: number;
    alert_threshold: number;
    created_at: Date;
    updated_at: Date;
    deleted_at: null;
    spent: number;
    category: Category;
    sub_category: SubCategory;
}