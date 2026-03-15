// components/customer_side/my_orders/MyOrderRow.tsx
import { useState } from 'react';
import type { Order } from '../../orders/orderTypes';
import { OrderItemsTable } from '../../orders/partials/OrderItemsTable';
import { showConfirmation, showToast } from '../../../utils/swalHelpers';
import api from '../../../services/api';

interface MyOrderRowProps {
    order: Order;
    expanded: boolean;
    onExpandToggle: (id: number) => void;
    onOrderCancelled?: (orderId: number) => void; // callback to refresh list
}

export function MyOrderRow({ order, expanded, onExpandToggle, onOrderCancelled }: MyOrderRowProps) {
    const [cancelling, setCancelling] = useState(false);
    const totalAmount = order.order_items?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;

    const handleExpandClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onExpandToggle(order.id);
    };

    const handleRowClick = () => {
        onExpandToggle(order.id);
    };

    const handleCancel = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const confirmed = await showConfirmation(
            'Cancel Order',
            `Are you sure you want to cancel order #${order.id}?`,
            'warning',
            'Yes, cancel'
        );
        if (!confirmed) return;

        setCancelling(true);
        try {
            await api.patch(`/orders/${order.id}/cancel`);
            showToast(`Order #${order.id} cancelled`, 'success');
            if (onOrderCancelled) onOrderCancelled(order.id);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_error) {
            showToast('Failed to cancel order', 'error');
        } finally {
            setCancelling(false);
        }
    };

    const getStatusBadge = () => {
        const statusMap: Record<string, { color: string; label: string }> = {
            pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', label: 'Pending' },
            preparing: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', label: 'Preparing' },
            ready: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', label: 'Ready' },
            completed: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', label: 'Completed' },
            cancelled: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', label: 'Cancelled' },
        };
        const { color, label } = statusMap[order.order_status] || statusMap.pending;
        return <span className={`px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap ${color}`}>{label}</span>;
    };

    const formatDateTime = (dateString?: string) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const customerName = order.user?.name || `User #${order.user_id}`;
    const itemCount = order.order_items?.length ?? 0;
    const canCancel = order.order_status === 'pending';

    return (
        <>
            <tr
                onClick={handleRowClick}
                className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                title="Click to expand/collapse"
            >
                <td className="w-16 px-4 py-3 text-gray-500 dark:text-gray-400 font-mono">#{order.id}</td>
                <td className="flex-1 px-4 py-3 font-medium text-gray-900 dark:text-gray-100 truncate">{customerName}</td>
                <td className="w-24 px-4 py-3 text-center">{getStatusBadge()}</td>
                <td className="w-28 px-4 py-3 text-gray-900 dark:text-gray-100 font-semibold text-right">₱{totalAmount.toFixed(2)}</td>
                <td className="w-20 px-4 py-3 text-gray-600 dark:text-gray-300 text-center">{itemCount}</td>
                <td className="w-28 px-4 py-3 text-gray-600 dark:text-gray-300 text-center text-xs">{formatDateTime(order.created_at)}</td>
                <td className="w-8 px-4 py-3 text-center">
                    {canCancel && (
                        <button
                            onClick={handleCancel}
                            disabled={cancelling}
                            className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                        >
                            {cancelling ? '...' : 'Cancel'}
                        </button>
                    )}
                </td>
                <td className="w-8 px-4 py-3 text-center">
                    <button onClick={handleExpandClick} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200" aria-label={expanded ? 'Collapse' : 'Expand'}>
                        <i className={`fas fa-chevron-${expanded ? 'up' : 'down'} text-sm`} />
                    </button>
                </td>
            </tr>

            {expanded && (
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                    <td colSpan={8} className="px-4 py-4">
                        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800">
                            <OrderItemsTable items={order.order_items || []} hideTopBorder={true} />
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}