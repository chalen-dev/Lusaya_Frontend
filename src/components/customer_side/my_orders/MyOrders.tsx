// components/customer_side/my_orders/MyOrders.tsx
import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useHeaderTitle } from '../../../contexts/HeaderTitleContext';
import api from '../../../services/api';
import { MyOrderRow } from './MyOrderRow';
import type { Order } from '../../orders/orderTypes';
import {LoadingScreen} from "../../common/loading/LoadingScreen.tsx";

// Status priority: ready > preparing > pending > completed > cancelled
const statusPriority: Record<string, number> = {
    ready: 1,
    preparing: 2,
    pending: 3,
    completed: 4,
    cancelled: 5,
};

export default function MyOrders() {
    const { setTitle } = useHeaderTitle();
    const queryClient = useQueryClient();
    const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

    useEffect(() => {
        setTitle('My Orders');
    }, [setTitle]);

    const { data: orders = [], isLoading } = useQuery({
        queryKey: ['my-orders'],
        queryFn: async () => {
            const response = await api.get<Order[]>('/orders'); // backend already filters by user
            return response.data;
        },
    });

    // Sort orders by status priority
    const sortedOrders = useMemo(() => {
        return [...orders].sort((a, b) => {
            const priorityA = statusPriority[a.order_status] || 999;
            const priorityB = statusPriority[b.order_status] || 999;
            return priorityA - priorityB;
        });
    }, [orders]);

    const handleExpandToggle = (id: number) => {
        setExpandedOrderId(expandedOrderId === id ? null : id);
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleOrderCancelled = (_orderId: number) => {
        queryClient.invalidateQueries({ queryKey: ['my-orders'] });
    };

    if (isLoading) return <LoadingScreen />;

    if (orders.length === 0) {
        return (
            <div className="container mx-auto p-6 text-center">
                <p className="text-gray-500 dark:text-gray-400">You haven't placed any orders yet.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                        <th className="w-16 px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID</th>
                        <th className="flex-1 px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                        <th className="w-24 px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                        <th className="w-28 px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                        <th className="w-20 px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Items</th>
                        <th className="w-28 px-4 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                        <th className="w-8 px-4 py-2 text-center"></th>
                        <th className="w-8 px-4 py-2 text-center"></th>
                    </tr>
                    </thead>
                    <tbody>
                    {sortedOrders.map((order) => (
                        <MyOrderRow
                            key={order.id}
                            order={order}
                            expanded={expandedOrderId === order.id}
                            onExpandToggle={handleExpandToggle}
                            onOrderCancelled={handleOrderCancelled}
                        />
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}