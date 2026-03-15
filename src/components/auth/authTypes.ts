export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'cashier' | 'customer';
    is_POS?: boolean; // true for POS customer
}

export interface LoginCredentials {
    name: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    token_type: string;
    user: User;
}