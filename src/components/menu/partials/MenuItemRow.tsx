// components/menu/partials/MenuItemRow.tsx
import type { MenuItem } from "../menuTypes";
import { showToast } from "../../../utils/swalHelpers";

interface MenuItemRowProps {
    item: MenuItem;
    onDelete: (id: number) => void;
    onEdit: (item: MenuItem) => void;
    onView: (id: number) => void;
    selectionMode?: boolean;
    isSelected?: boolean;
    onToggleSelection?: (id: number) => void;
}

export function MenuItemRow({
                                item,
                                onDelete,
                                onEdit,
                                onView,
                                selectionMode = false,
                                isSelected = false,
                                onToggleSelection
                            }: MenuItemRowProps) {
    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectionMode) return;
        onEdit(item);
        showToast(`Item #${item.id} placed on the edit form.`, 'info');
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (selectionMode) return;
        onDelete(item.id);
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        if (onToggleSelection) {
            onToggleSelection(item.id);
        }
    };

    const handleRowClick = () => {
        if (selectionMode) {
            if (onToggleSelection) {
                onToggleSelection(item.id);
            }
        } else {
            onView(item.id);
        }
    };

    const selectedRowClass = selectionMode && isSelected ? 'bg-blue-100 dark:bg-blue-900/50' : '';

    return (
        <tr
            onClick={handleRowClick}
            className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${selectedRowClass}`}
            title={selectionMode ? "Click to select" : "Click to view details"}
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
                #{item.id}
            </td>

            <td className="flex-1 px-4 py-3 font-medium text-gray-900 dark:text-gray-100">
                {item.name}
            </td>

            <td className="w-20 px-4 py-3 text-gray-600 dark:text-gray-300">
                {item.code}
            </td>

            <td className="w-32 px-4 py-3 text-gray-600 dark:text-gray-300">
                {item.category?.name || 'Uncategorized'}
            </td>

            <td className="w-24 px-4 py-3 text-gray-900 dark:text-gray-100 font-semibold text-right">
                ₱{Number(item.price).toFixed(2)}
            </td>

            <td className="w-32 px-4 py-3 text-right">
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
        </tr>
    );
}