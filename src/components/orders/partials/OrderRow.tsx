// components/orders/partials/OrderRow.tsx
import { useState } from 'react';
import type {Order} from "../orderTypes.ts";
import {showToast} from "../../../utils/swalHelpers.ts";
import {OrderItemsTable} from "./OrderItemsTable.tsx";
import {OrderStatusModal} from "./order_card/OrderStatusModal.tsx";

interface OrderRowProps {
    order: Order;
    onDelete: (id: number) => void;
    onEdit: (order: Order) => void;
    onStatusChange?: (orderId: number, newStatus: string) => Promise<void>;
    selectionMode?: boolean;
    isSelected?: boolean;
    onToggleSelection?: (id: number) => void;
    expanded: boolean;
    onExpandToggle: (id: number) => void;
}

export function OrderRow({
                             order,
                             onDelete,
                             onEdit,
                             onStatusChange,
                             selectionMode = false,
                             isSelected = false,
                             onToggleSelection,
                             expanded,
                             onExpandToggle
                         }: OrderRowProps) {
    const [statusModalOpen, setStatusModalOpen] = useState(false);

    const totalAmount = order.order_items?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectionMode) return;
        onEdit(order);
        showToast(`Order #${order.id} placed on the edit form.`, 'info');
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectionMode) return;
        onDelete(order.id);
    };

    const handleStatusClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectionMode || !onStatusChange) return;
        setStatusModalOpen(true);
    };

    const handleStatusChange = async (orderId: number, newStatus: string) => {
        if (!onStatusChange) return;
        await onStatusChange(orderId, newStatus);
        showToast(`Order #${orderId} status updated to ${newStatus}`, 'success');
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        if (onToggleSelection) {
            onToggleSelection(order.id);
        }
    };

    const handleExpandClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onExpandToggle(order.id);
    };

    const handleRowClick = () => {
        if (selectionMode) {
            if (onToggleSelection) {
                onToggleSelection(order.id);
            }
        } else {
            onExpandToggle(order.id);
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
        return (
            <button
                className={`px-3 py-1.5 text-xs font-semibold rounded-full whitespace-nowrap transition-all hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-1 ${color}`}
                onClick={handleStatusClick}
                disabled={selectionMode}
            >
                {label}
            </button>
        );
    };

    const formatDateTime = (dateString?: string) => {
        if (!dateString) return '—';
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const customerName = order.user?.name || `User #${order.user_id}`;
    const itemCount = order.order_items?.length ?? 0;

    const selectedRowClass = selectionMode && isSelected ? 'bg-blue-100 dark:bg-blue-900/50' : '';

    return (
        <>
            <tr
                onClick={handleRowClick}
                className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${selectedRowClass}`}
                title={selectionMode ? "Click to select" : "Click to expand/collapse"}
            >
                {selectionMode && (
                    <td className="w-10 px-4 py-3 text-center">
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={handleCheckboxChange}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                    </td>
                )}

                <td className={`${selectionMode ? 'w-20' : 'w-16'} px-4 py-3 text-gray-500 dark:text-gray-400 font-mono`}>
                    #{order.id}
                </td>

                <td className="flex-1 px-4 py-3 font-medium text-gray-900 dark:text-gray-100 truncate">
                    {customerName}
                </td>

                <td className="w-24 px-4 py-3 text-center">
                    {getStatusBadge()}
                </td>

                <td className="w-28 px-4 py-3 text-gray-900 dark:text-gray-100 font-semibold text-right">
                    ₱{totalAmount.toFixed(2)}
                </td>

                {/* Items cell – just the number */}
                <td className="w-20 px-4 py-3 text-gray-600 dark:text-gray-300 text-center">
                    {itemCount}
                </td>

                <td className="w-28 px-4 py-3 text-gray-600 dark:text-gray-300 text-center text-xs">
                    {formatDateTime(order.created_at)}
                </td>

                <td className="w-28 px-4 py-3 text-gray-600 dark:text-gray-300 text-center text-xs">
                    {order.updated_at && order.updated_at !== order.created_at
                        ? formatDateTime(order.updated_at)
                        : '—'}
                </td>

                <td className="w-40 px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={handleEdit}
                            disabled={selectionMode}
                            className="px-3 py-1 text-sm rounded transition-colors bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Edit
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={selectionMode}
                            className="px-3 py-1 text-sm rounded transition-colors bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Delete
                        </button>
                    </div>
                </td>

                <td className="w-8 px-4 py-3 text-center">
                    <button
                        onClick={handleExpandClick}
                        disabled={selectionMode}
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={expanded ? 'Collapse' : 'Expand'}
                    >
                        <i className={`fas fa-chevron-${expanded ? 'up' : 'down'} text-sm`} />
                    </button>
                </td>
            </tr>

            {/* Expanded row – removed top border and added consistent padding */}
            {expanded && (
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                    <td colSpan={selectionMode ? 10 : 9} className="px-4 py-4">
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                            <OrderItemsTable items={order.order_items || []} />
                        </div>
                    </td>
                </tr>
            )}

            <OrderStatusModal
                isOpen={statusModalOpen}
                onClose={() => setStatusModalOpen(false)}
                currentStatus={order.order_status}
                orderId={order.id}
                onStatusChange={handleStatusChange}
            />
        </>
    );
}