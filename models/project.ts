import { Transaction } from "./transaction";

export interface Project {
    id: number;
    user_id: number;
    name: string;
    client_name: string;
    status: string;
    transactions?: Transaction[];
    created_at: Date;
    updated_at: Date;
}