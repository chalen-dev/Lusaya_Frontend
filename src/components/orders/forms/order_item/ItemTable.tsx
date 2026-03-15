// components/orders/forms/order_item/ItemTable.tsx
import type { InventoryLog } from "../../../inventory/inventoryTypes.ts";

interface ItemTableProps {
    logs: InventoryLog[];
    selectedItems: Map<number, number>;
    onCheckboxChange: (id: number, checked: boolean) => void;
    isAvailable: (log: InventoryLog) => boolean;
}

export function ItemTable({
                              logs,
                              selectedItems,
                              onCheckboxChange,
                              isAvailable
                          }: ItemTableProps) {
    const isExpired = (log: InventoryLog) => {
        return log.inventory_status === 'expired' || (log.expiry_date && new Date(log.expiry_date) < new Date());
    };

    const getStatusBadge = (log: InventoryLog) => {
        if (isExpired(log)) {
            return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Expired</span>;
        }
        if (!log.is_available) {
            return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">Unavailable</span>;
        }
        if (log.quantity_in_stock === 0) {
            return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Out of Stock</span>;
        }
        if (log.quantity_in_stock < 10) {
            return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">Low Stock</span>;
        }
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">In Stock</span>;
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString();
    };

    const handleToggleSelect = (log: InventoryLog) => {
        if (!isAvailable(log)) return;
        const checked = !selectedItems.has(log.id);
        onCheckboxChange(log.id, checked);
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
                <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0 z-10 shadow-sm">
                <tr>
                    <th className="px-3 py-2 w-10"></th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Inv ID</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Item</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acquired</th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Expiry</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                    <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {logs.map(log => {
                    const disabled = !isAvailable(log);
                    const selected = selectedItems.has(log.id);
                    return (
                        <tr
                            key={log.id}
                            className={`${disabled ? 'opacity-50' : ''} ${selected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                        >
                            <td
                                className="px-3 py-2 cursor-pointer"
                                onClick={() => !disabled && handleToggleSelect(log)}
                            >
                                <input
                                    type="checkbox"
                                    checked={selected}
                                    onChange={(e) => onCheckboxChange(log.id, e.target.checked)}
                                    onClick={(e) => e.stopPropagation()}
                                    disabled={disabled}
                                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary disabled:opacity-50 pointer-events-none"
                                />
                            </td>
                            <td
                                className="px-3 py-2 text-gray-500 dark:text-gray-400 font-mono cursor-pointer"
                                onClick={() => !disabled && handleToggleSelect(log)}
                            >
                                {log.id}
                            </td>
                            <td
                                className="px-3 py-2 text-gray-900 dark:text-gray-100 cursor-pointer"
                                onClick={() => !disabled && handleToggleSelect(log)}
                            >
                                {log.menu_item?.name || 'Unknown'} ({log.menu_item?.code})
                            </td>
                            <td
                                className="px-3 py-2 text-gray-600 dark:text-gray-400 cursor-pointer"
                                onClick={() => !disabled && handleToggleSelect(log)}
                            >
                                {log.menu_item?.category?.name || '—'}
                            </td>
                            <td
                                className="px-3 py-2 cursor-pointer"
                                onClick={() => !disabled && handleToggleSelect(log)}
                            >
                                {getStatusBadge(log)}
                            </td>
                            <td
                                className="px-3 py-2 text-gray-600 dark:text-gray-400 cursor-pointer"
                                onClick={() => !disabled && handleToggleSelect(log)}
                            >
                                {formatDate(log.date_acquired)}
                            </td>
                            <td
                                className="px-3 py-2 text-gray-600 dark:text-gray-400 cursor-pointer"
                                onClick={() => !disabled && handleToggleSelect(log)}
                            >
                                {formatDate(log.expiry_date)}
                            </td>
                            <td
                                className="px-3 py-2 text-right text-gray-900 dark:text-gray-100 cursor-pointer"
                                onClick={() => !disabled && handleToggleSelect(log)}
                            >
                                ₱{Number(log.menu_item?.price || 0).toFixed(2)}
                            </td>
                            <td
                                className="px-3 py-2 text-right text-gray-600 dark:text-gray-400 cursor-pointer"
                                onClick={() => !disabled && handleToggleSelect(log)}
                            >
                                {log.quantity_in_stock}
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
}