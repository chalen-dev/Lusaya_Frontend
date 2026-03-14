// components/orders/partials/OrderCard.tsx
import { useState } from 'react';
import { OrderStatusModal } from './OrderStatusModal';
import {showToast} from "../../../../utils/swalHelpers.ts";
import type {Order} from "../../orderTypes.ts";
import {OrderItemsTable} from "../OrderItemsTable.tsx";

interface OrderCardProps {
    order: Order;
    onDelete: (id: number) => void;
    onEdit: (order: Order) => void;
    onView: (id: number) => void;
    onStatusChange?: (orderId: number, newStatus: string) => Promise<void>;
    selectionMode?: boolean;
    isSelected?: boolean;
    onToggleSelection?: (id: number) => void;
}

export function OrderCard({
                              order,
                              onDelete,
                              onEdit,
                              onView,
                              onStatusChange,
                              selectionMode = false,
                              isSelected = false,
                              onToggleSelection
                          }: OrderCardProps) {
    const [expanded, setExpanded] = useState(false);
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

    const handleView = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectionMode) return;
        onView(order.id);
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

    const handleCardClick = () => {
        if (selectionMode) {
            if (onToggleSelection) {
                onToggleSelection(order.id);
            }
        } else {
            setExpanded(!expanded);
        }
    };

    const handleExpandToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!selectionMode) {
            setExpanded(!expanded);
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
                className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-1 ${color}`}
                onClick={handleStatusClick}
                disabled={selectionMode}
            >
                {label}
            </button>
        );
    };

    const selectedStyles = selectionMode && isSelected
        ? 'bg-blue-100 dark:bg-blue-900/50 border-2 border-primary'
        : '';

    const formatDate = (dateString?: string) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString();
    };

    const customerName = order.user?.name || `User #${order.user_id}`;
    const itemCount = order.order_items?.length ?? 0;

    return (
        <div
            className={`w-full border rounded-lg shadow-sm transition-all bg-white dark:bg-gray-800 ${selectedStyles} ${
                !selectionMode && 'hover:shadow-md'
            }`}
        >
            <div
                onClick={handleCardClick}
                className={`flex items-center w-full p-4 cursor-pointer gap-4 ${
                    expanded ? 'rounded-t-lg' : 'rounded-lg'
                } ${!selectionMode ? 'hover:bg-gray-50 dark:hover:bg-gray-700' : ''}`}
            >
                {selectionMode && (
                    <div className="w-10 flex justify-center">
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={handleCheckboxChange}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                    </div>
                )}

                <div className={`${selectionMode ? 'w-20' : 'w-16'} text-gray-500 dark:text-gray-400 font-mono`}>
                    #{order.id}
                </div>

                <div className="flex-1 font-medium text-gray-900 dark:text-gray-100 truncate">
                    {customerName}
                </div>

                <div className="w-24 flex justify-center">
                    {getStatusBadge()}
                </div>

                <div className="w-28 text-gray-900 dark:text-gray-100 font-semibold text-right">
                    ₱{totalAmount.toFixed(2)}
                </div>

                <div className="w-20 text-gray-600 dark:text-gray-300 text-center">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </div>

                <div className="w-28 text-gray-600 dark:text-gray-300 text-center">
                    {formatDate(order.created_at)}
                </div>

                <div className="w-40 flex gap-2 justify-end">
                    <button
                        onClick={handleView}
                        disabled={selectionMode}
                        className="px-3 py-1 text-sm rounded transition-colors bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        View
                    </button>
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

                <button
                    onClick={handleExpandToggle}
                    disabled={selectionMode}
                    className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={expanded ? 'Collapse' : 'Expand'}
                >
                    <i className={`fas fa-chevron-${expanded ? 'up' : 'down'} text-sm`} />
                </button>
            </div>

            {expanded && (
                <div className="px-4 pb-4">
                    <OrderItemsTable items={order.order_items || []} />
                </div>
            )}

            <OrderStatusModal
                isOpen={statusModalOpen}
                onClose={() => setStatusModalOpen(false)}
                currentStatus={order.order_status}
                orderId={order.id}
                onStatusChange={handleStatusChange}
            />
        </div>
    );
}