export interface Income {
    account_id:  number;
    amount:      string;
    created_at:  Date;
    date:        Date;
    description: string;
    executed:    number;
    frequency:   string;
    id:          number;
    programmed:  number;
    reminder:    number;
    source:      string;
    tags:        any[];
    type:        string;
    updated_at:  Date;
    user_id:     number;
}