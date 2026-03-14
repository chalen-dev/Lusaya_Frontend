import type { InventoryLog } from "../inventoryTypes";
import { showToast } from "../../../utils/swalHelpers";
import { useState, useEffect } from 'react';

interface InventoryCardProps {
    log: InventoryLog;
    onDelete: (id: number) => void;
    onEdit: (log: InventoryLog) => void;
    onView: (id: number) => void;
    onToggleAvailability?: (id: number, currentAvailability: boolean) => void;
    onUpdateQuantity?: (id: number, newQuantity: number) => Promise<void>;
    selectionMode?: boolean;
    isSelected?: boolean;
    onToggleSelection?: (id: number) => void;
}

export function InventoryCard({
                                  log,
                                  onDelete,
                                  onEdit,
                                  onView,
                                  onToggleAvailability,
                                  onUpdateQuantity,
                                  selectionMode = false,
                                  isSelected = false,
                                  onToggleSelection
                              }: InventoryCardProps) {
    const [isEditingQty, setIsEditingQty] = useState(false);
    const [editedQuantity, setEditedQuantity] = useState(log.quantity_in_stock);

    // Exit edit mode if selection mode becomes active
    useEffect(() => {
        if (selectionMode) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsEditingQty(false);
        }
    }, [selectionMode]);

    const handleEdit = () => {
        if (selectionMode) return;
        onEdit(log);
        showToast('Item has been placed on the edit form.', 'info');
    };

    const handleDelete = () => {
        if (selectionMode) return;
        onDelete(log.id);
    };

    const handleToggleAvailability = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectionMode || !onToggleAvailability) return;
        onToggleAvailability(log.id, log.is_available);
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        if (onToggleSelection) {
            onToggleSelection(log.id);
        }
    };

    const handleCardClick = () => {
        if (isEditingQty) return;
        if (selectionMode) {
            if (onToggleSelection) {
                onToggleSelection(log.id);
            }
        } else {
            onView(log.id);
        }
    };

    const handleQtyEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectionMode) return;
        setIsEditingQty(true);
        setEditedQuantity(log.quantity_in_stock);
    };

    const handleIncrement = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditedQuantity(prev => prev + 1);
    };

    const handleDecrement = (e: React.MouseEvent) => {
        e.stopPropagation();
        setEditedQuantity(prev => Math.max(0, prev - 1));
    };

    const handleSaveQuantity = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!onUpdateQuantity || editedQuantity === log.quantity_in_stock) {
            setIsEditingQty(false);
            return;
        }

        try {
            await onUpdateQuantity(log.id, editedQuantity);
            setIsEditingQty(false);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (_error) {
            // Error toast is handled in parent
        }
    };

    const handleCancelEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditingQty(false);
    };

    const selectedStyles = selectionMode && isSelected
        ? 'bg-blue-200 dark:bg-blue-700 border-l-4 border-l-primary'
        : '';

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString();
    };

    const getStatusBadge = () => {
        if (log.inventory_status === 'expired' || (log.expiry_date && new Date(log.expiry_date) < new Date())) {
            return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Expired</span>;
        }
        if (log.quantity_in_stock <= 0) {
            return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Out of Stock</span>;
        }
        if (log.quantity_in_stock < 10) {
            return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">Low Stock</span>;
        }
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">In Stock</span>;
    };

    const formatPrice = (price: number | string | undefined) => {
        if (price === undefined) return '—';
        const num = typeof price === 'string' ? parseFloat(price) : price;
        return `₱${num.toFixed(2)}`;
    };

    return (
        <div
            onClick={handleCardClick}
            className={`flex items-center w-full p-4 border rounded-lg shadow-sm transition-all bg-white dark:bg-gray-800 ${selectedStyles} cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                !selectionMode && 'hover:shadow-md'
            }`}
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

            {/* ID */}
            <div className={`${selectionMode ? 'w-20' : 'w-16'} text-gray-500 dark:text-gray-400 font-mono`}>
                #{log.id}
            </div>

            {/* Item Name */}
            <div className="flex-1 font-medium text-gray-900 dark:text-gray-100">
                {log.menu_item?.name || 'Unknown Item'}
            </div>

            {/* Price */}
            <div className="w-20 text-gray-600 dark:text-gray-300 text-center">
                {formatPrice(log.menu_item?.price)}
            </div>

            {/* Quantity - editable in edit mode */}
            <div className="w-16 text-gray-600 dark:text-gray-300 text-center">
                {isEditingQty ? (
                    <div className="flex items-center justify-center gap-1">
                        <button
                            onClick={handleDecrement}
                            disabled={selectionMode}
                            className="w-5 h-5 flex items-center justify-center bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white rounded text-xs font-bold disabled:opacity-50"
                        >
                            -
                        </button>
                        <span className="w-8 text-sm font-medium">{editedQuantity}</span>
                        <button
                            onClick={handleIncrement}
                            disabled={selectionMode}
                            className="w-5 h-5 flex items-center justify-center bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded text-xs font-bold disabled:opacity-50"
                        >
                            +
                        </button>
                    </div>
                ) : (
                    log.quantity_in_stock
                )}
            </div>

            {/* Date Acquired */}
            <div className="w-28 text-gray-600 dark:text-gray-300 text-center">
                {formatDate(log.date_acquired)}
            </div>

            {/* Expiry Date */}
            <div className="w-28 text-gray-600 dark:text-gray-300 text-center">
                {formatDate(log.expiry_date)}
            </div>

            {/* Status Badge */}
            <div className="w-24 flex justify-center">
                {getStatusBadge()}
            </div>

            {/* Availability Toggle - redesigned as clickable pill */}
            <div className="w-20 flex justify-center">
                <button
                    onClick={handleToggleAvailability}
                    disabled={selectionMode || !onToggleAvailability}
                    className={`flex items-center justify-center gap-1 px-2 py-1 text-xs font-medium rounded-full border shadow-sm transition-all ${
                        log.is_available
                            ? 'bg-green-500 text-white border-green-600 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 dark:border-green-500'
                            : 'bg-gray-500 text-white border-gray-600 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 dark:border-gray-500'
                    } focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                        log.is_available ? 'focus:ring-green-500' : 'focus:ring-gray-500'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    <i className={`fas fa-${log.is_available ? 'check' : 'times'} text-xs`} />
                    <span>{log.is_available ? 'Available' : 'Unavailable'}</span>
                </button>
            </div>

            {/* Actions */}
            <div className="w-36 flex gap-1 justify-end">
                {isEditingQty ? (
                    <>
                        <button
                            onClick={handleSaveQuantity}
                            disabled={selectionMode}
                            className="px-2 py-1 text-xs font-medium bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Save
                        </button>
                        <button
                            onClick={handleCancelEdit}
                            disabled={selectionMode}
                            className="px-2 py-1 text-xs font-medium bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                    </>
                ) : (
                    <>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleEdit();
                            }}
                            disabled={selectionMode}
                            className="px-2 py-1 text-xs font-medium bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Edit
                        </button>
                        <button
                            onClick={handleQtyEditClick}
                            disabled={selectionMode}
                            className="px-2 py-1 text-xs font-medium bg-purple-500 text-white rounded hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Qty
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete();
                            }}
                            disabled={selectionMode}
                            className="px-2 py-1 text-xs font-medium bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Delete
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}