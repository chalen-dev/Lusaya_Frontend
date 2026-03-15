// components/pos/partials/ProductGrid.tsx
import type { InventoryLog } from "../../inventory/inventoryTypes.ts";
import { Pagination } from "../../common/Pagination.tsx";

interface ProductGridProps {
    paginatedLogs: InventoryLog[];
    totalPages: number;
    currentPage: number;
    onPageChange: (page: number) => void;
    onAddToCart: (log: InventoryLog) => void;
    isOutOfStock: (log: InventoryLog) => boolean;
    columnCount?: number;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
                                                            paginatedLogs,
                                                            totalPages,
                                                            currentPage,
                                                            onPageChange,
                                                            onAddToCart,
                                                            isOutOfStock,
                                                            columnCount = 2,
                                                        }) => {
    const gridCols = {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
    }[columnCount] || 'grid-cols-2';

    return (
        <>
            <div className={`grid ${gridCols} gap-4`}>
                {paginatedLogs.map((log) => {
                    const outOfStock = isOutOfStock(log);
                    return (
                        <button
                            key={log.id}
                            onClick={() => onAddToCart(log)}
                            disabled={outOfStock}
                            className={`bg-gray-50 dark:bg-gray-700 rounded-lg p-4 text-left hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-600 ${
                                outOfStock ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            <div className="font-medium text-gray-900 dark:text-white">
                                {log.menu_item?.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {log.menu_item?.code}
                            </div>
                            <div className="mt-2 text-lg font-bold text-primary">
                                ₱{Number(log.menu_item?.price).toFixed(2)}
                            </div>
                            <div className="text-xs mt-1">
                                {log.quantity_in_stock > 0 ? (
                                    log.quantity_in_stock <= 10 ? (
                                        <span className="text-yellow-600 dark:text-yellow-400">Low Stock</span>
                                    ) : (
                                        <span className="text-green-600 dark:text-green-400">In Stock</span>
                                    )
                                ) : (
                                    <span className="text-red-600 dark:text-red-400">Out of Stock</span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
            {totalPages > 1 && (
                <div className="mt-4">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={onPageChange}
                    />
                </div>
            )}
        </>
    );
};