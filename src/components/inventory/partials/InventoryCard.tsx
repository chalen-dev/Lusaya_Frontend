// InventoryCard.tsx
import type { InventoryLog } from "../inventoryTypes";
import { showToast } from "../../../utils/swalHelpers";

interface InventoryCardProps {
    log: InventoryLog;
    onDelete: (id: number) => void;
    onEdit: (log: InventoryLog) => void;
    onView: (id: number) => void;
    onToggleAvailability?: (id: number, currentAvailability: boolean) => void;
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
                                  selectionMode = false,
                                  isSelected = false,
                                  onToggleSelection
                              }: InventoryCardProps) {
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
        if (selectionMode) {
            if (onToggleSelection) {
                onToggleSelection(log.id);
            }
        } else {
            onView(log.id);
        }
    };

    const selectedStyles = selectionMode && isSelected
        ? 'bg-blue-100 dark:bg-blue-900/50 border-l-4 border-l-primary'
        : '';

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString();
    };

    // Status badge now purely based on quantity and expiry – no longer affected by is_available
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

            {/* Quantity */}
            <div className="w-16 text-gray-600 dark:text-gray-300 text-center">
                {log.quantity_in_stock}
            </div>

            {/* Date Acquired */}
            <div className="w-28 text-gray-600 dark:text-gray-300 text-center">
                {formatDate(log.date_acquired)}
            </div>

            {/* Expiry Date */}
            <div className="w-28 text-gray-600 dark:text-gray-300 text-center">
                {formatDate(log.expiry_date)}
            </div>

            {/* Status Badge (independent of availability) */}
            <div className="w-24 flex justify-center">
                {getStatusBadge()}
            </div>

            {/* Availability Toggle */}
            <div className="w-20 flex justify-center">
                <button
                    onClick={handleToggleAvailability}
                    disabled={selectionMode || !onToggleAvailability}
                    className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                        log.is_available
                            ? 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    } ${selectionMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {log.is_available ? 'Available' : 'Unavailable'}
                </button>
            </div>

            {/* Actions */}
            <div className="w-32 flex gap-2 justify-end">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleEdit();
                    }}
                    disabled={selectionMode}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                        selectionMode
                            ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                    }`}
                >
                    Edit
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDelete();
                    }}
                    disabled={selectionMode}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                        selectionMode
                            ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                            : 'bg-red-500 text-white hover:bg-red-600'
                    }`}
                >
                    Delete
                </button>
            </div>
        </div>
    );
}