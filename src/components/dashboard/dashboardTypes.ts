// components/dashboard/dashboardTypes.ts

export interface SummaryData {
    total_sales: number;
    total_orders: number;
    avg_order_value: number;
}

export interface SalesPeriodItem {
    date: string;
    total_sales: number;
}

export interface BestSellingItem {
    id: number;
    name: string;
    code: string;
    total_quantity: number;
    total_revenue: number;
}

export interface CategorySalesItem {
    id: number;
    name: string;
    total_sales: number;
}

export interface OrderVolumeItem {
    date: string;
    order_count: number;
}

export const PRESETS = {
    'today': { days: 1, label: 'Today' },
    '7d': { days: 7, label: 'Last 7 days' },
    '30d': { days: 30, label: 'Last 30 days' },
    '90d': { days: 90, label: 'Last 90 days' },
} as const;

export const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042',
    '#A569BD', '#5D9B9B', '#E67E22', '#3498DB'
] as const;