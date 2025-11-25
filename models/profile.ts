import { Subscription } from "./subscription";

export interface Profile {
    id: number;
    name: string;
    email: string;
    whatsapp_phone: string;
    whatsapp_notifications_enabled: boolean;
    daily_tips_enabled: boolean;
    timezone: string;
    stripe_id: string;
    profile_photo_url: string;
    subscription: Subscription | null;
}