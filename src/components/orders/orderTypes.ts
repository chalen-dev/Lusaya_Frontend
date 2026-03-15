import type {InventoryLog} from "../inventory/inventoryTypes.ts";


export interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    isPOS?: boolean; // optional
}

export interface OrderItem {
    id: number;
    order_id: number;
    inventory_id: number;
    quantity: number;
    amount: number;
    created_at?: string;
    updated_at?: string;
    inventory_log?: InventoryLog; // with menu_item inside
}

export interface Order {
    id: number;
    order_status: OrderStatus;
    total_amount: number;
    description: string | null;
    user_id: number;
    created_at?: string;
    updated_at?: string;
    user?: User;
    order_items?: OrderItem[];
}

export const OrderStatus = {
    PENDING: 'pending',
    PREPARING: 'preparing',
    READY: 'ready',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
} as const;

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

export const ORDER_STATUS_OPTIONS = [
    { value: OrderStatus.PENDING, label: 'Pending' },
    { value: OrderStatus.PREPARING, label: 'Preparing' },
    { value: OrderStatus.READY, label: 'Ready' },
    { value: OrderStatus.COMPLETED, label: 'Completed' },
    { value: OrderStatus.CANCELLED, label: 'Cancelled' },
] as const;

export type OrderStatusFilter = OrderStatus | 'all';

export const STATUS_PRIORITY: Record<OrderStatus, number> = {
    pending: 1,
    preparing: 2,
    ready: 3,
    completed: 4,
    cancelled: 5,
};