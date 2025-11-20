export interface Notification {
    id: string;
    type: string;
    notifiable_type: string;
    notifiable_id: number;
    data: any;
    read_at: Date | null;
    created_at: Date;
    updated_at: Date;
}