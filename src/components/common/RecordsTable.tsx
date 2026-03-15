// components/common/RecordsTable.tsx
import React from 'react';

export interface Column {
    key: string;
    label: string;
    width: string; // e.g. 'w-20', 'flex-1', 'w-28'
    align?: 'left' | 'center' | 'right';
}

interface RecordsTableProps<T> {
    columns: Column[];
    data: T[];
    keyField: keyof T | ((item: T) => string | number);
    renderCell: (item: T, column: Column) => React.ReactNode;
    onRowClick?: (item: T) => void;
    selectionMode?: boolean;
    selectedItems?: Set<string | number>;
    onToggleSelection?: (id: string | number) => void;
    getItemId: (item: T) => string | number;
    className?: string;
    style?: React.CSSProperties;
    emptyMessage?: string;
}

// ========== RecordsRow Component ==========
interface RecordsRowProps<T> {
    item: T;
    columns: Column[];
    renderCell: (item: T, column: Column) => React.ReactNode;
    onRowClick?: (item: T) => void;
    selectionMode: boolean;
    isSelected: boolean;
    onToggleSelection?: (id: string | number) => void;
    getItemId: (item: T) => string | number;
}

function RecordsRow<T>({
                           item,
                           columns,
                           renderCell,
                           onRowClick,
                           selectionMode,
                           isSelected,
                           onToggleSelection,
                           getItemId
                       }: RecordsRowProps<T>) {
    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.stopPropagation();
        if (onToggleSelection) {
            onToggleSelection(getItemId(item));
        }
    };

    const handleRowClick = () => {
        if (selectionMode) {
            if (onToggleSelection) {
                onToggleSelection(getItemId(item));
            }
        } else if (onRowClick) {
            onRowClick(item);
        }
    };

    const rowClasses = `
        flex items-center w-full p-4 border rounded-lg shadow-sm transition-all bg-white dark:bg-gray-800 cursor-pointer
        ${!selectionMode ? 'hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-md' : ''}
        ${selectionMode && isSelected ? 'bg-blue-100 dark:bg-blue-900/50 border-2 border-primary' : ''}
    `;

    return (
        <div className={rowClasses} onClick={handleRowClick}>
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
            {columns.map(col => (
                <div
                    key={col.key}
                    className={`${col.width} ${
                        col.align === 'center' ? 'text-center' :
                            col.align === 'right' ? 'text-right' : 'text-left'
                    }`}
                >
                    {renderCell(item, col)}
                </div>
            ))}
        </div>
    );
}

// ========== Main RecordsTable ==========
export function RecordsTable<T>({
                                    columns,
                                    data,
                                    keyField,
                                    renderCell,
                                    onRowClick,
                                    selectionMode = false,
                                    selectedItems = new Set(),
                                    onToggleSelection,
                                    getItemId,
                                    className = '',
                                    style,
                                    emptyMessage = 'No records found.'
                                }: RecordsTableProps<T>) {
    const getKey = (item: T): string | number => {
        if (typeof keyField === 'function') {
            return keyField(item);
        }
        return item[keyField] as string | number;
    };

    // Build header columns (including selection column if needed)
    const headerColumns = selectionMode
        ? [{ key: '_selection', label: '', width: 'w-10', align: 'center' as const }, ...columns]
        : columns;

    return (
        <div className={`records-table ${className}`} style={style}>
            {/* Header – all text centered */}
            <div className="flex items-center w-full p-4 mb-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                {headerColumns.map(col => (
                    <div
                        key={col.key}
                        className={`${col.width} text-center`}
                    >
                        {col.label}
                    </div>
                ))}
            </div>

            {/* Rows */}
            {data.length === 0 ? (
                <div className="w-full text-center py-8 text-gray-500 dark:text-gray-400">
                    {emptyMessage}
                </div>
            ) : (
                <div className="space-y-2">
                    {data.map(item => {
                        const id = getItemId(item);
                        const isSelected = selectedItems.has(id);
                        return (
                            <RecordsRow
                                key={getKey(item)}
                                item={item}
                                columns={columns}
                                renderCell={renderCell}
                                onRowClick={onRowClick}
                                selectionMode={selectionMode}
                                isSelected={isSelected}
                                onToggleSelection={onToggleSelection}
                                getItemId={getItemId}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}