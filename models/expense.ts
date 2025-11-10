import { Category } from "./category";
import { SubCategory } from "./subcategory";

export interface Expense {
    id:                number;
    user_id:           number;
    category_id:       number;
    account_id:        number;
    type:              string;
    name:              string;
    description:       null;
    amount:            string;
    frequency:         string;
    due_date:          Date;
    dispensable:       boolean;
    reminder:          boolean;
    programmed:        boolean;
    executed:          number;
    paid_at:           null;
    is_late:           boolean;
    next_payment_date: Date;
    is_paid:           boolean;
    estimated_amount:  null;
    ticket_image_url:  null;
    invoice_xml_url:   null;
    has_details:       number;
    created_at:        Date;
    updated_at:        Date;
    sub_category_id:   number;
    category?:          Category;
    sub_category?:      SubCategory;
}