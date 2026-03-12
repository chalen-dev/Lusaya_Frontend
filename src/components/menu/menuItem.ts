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
}