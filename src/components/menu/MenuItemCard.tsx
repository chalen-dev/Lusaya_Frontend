import type { MenuItem } from "./menuTypes.ts";
import { showToast } from "../../utils/swalHelpers.ts";

interface MenuItemCardProps {
    item: MenuItem;
    onDelete: (id: number) => void;
    onEdit: (item: MenuItem) => void;
    onView: (id: number) => void;
    selectionMode?: boolean;
    isSelected?: boolean;
    onToggleSelection?: (id: number) => void;
}

export function MenuItemCard({
                                 item,
                                 onDelete,
                                 onEdit,
                                 onView,
                                 selectionMode = false,
                                 isSelected = false,
                                 onToggleSelection
                             }: MenuItemCardProps) {
    const handleEdit = () => {
        if (selectionMode) return;
        onEdit(item);
        showToast('Item has been placed on the edit form.', 'info');
    };

    const handleDelete = () => {
        if (selectionMode) return;
        onDelete(item.id);
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        if (onToggleSelection) {
            onToggleSelection(item.id);
        }
    };

    const handleCardClick = () => {
        if (selectionMode) {
            if (onToggleSelection) {
                onToggleSelection(item.id);
            }
        } else {
            onView(item.id);
        }
    };

    const selectedStyles = selectionMode && isSelected
        ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-primary'
        : '';

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

            <div className={`${selectionMode ? 'w-20' : 'w-16'} text-gray-500 dark:text-gray-400 font-mono`}>
                #{item.id}
            </div>

            <div className="flex-1 font-medium text-gray-900 dark:text-gray-100">
                {item.name}
            </div>

            <div className="w-32 text-gray-600 dark:text-gray-300">
                {item.category?.name || 'Uncategorized'}
            </div>

            <div className="w-24 text-gray-900 dark:text-gray-100 font-semibold">
                ₱{Number(item.price).toFixed(2)}
            </div>

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