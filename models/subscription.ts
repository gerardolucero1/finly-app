export interface Subscription {
    stripe_price:  string;
    stripe_status: string;
    trial_ends_at: null;
    ends_at:       Date | null;
}