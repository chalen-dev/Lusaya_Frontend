export interface MenuItem {
    id: number;
    name: string;
    price: string | number;
    code: string;
    description?: string;
    category?: {
        id: number;
        name: string;
    } | null;
    image_url?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface Category {
    id: number;
    name: string;
}

export interface EditingMenuItem {
    id: number;
    name: string;
    price: number;
    code: string;
    category_id: number;
    description?: string;
    image_url?: string | null;
}