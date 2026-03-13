// components/common/TableHeader.tsx
export interface Column {
    key: string;
    label: string;
    width: string; // Tailwind width class, e.g., 'w-16', 'w-32', 'flex-1'
    align?: 'left' | 'center' | 'right';
}

interface TableHeaderProps {
    columns: Column[];
    selectionMode?: boolean;
    className?: string;
}

export function TableHeader({ columns, selectionMode = false, className = '' }: TableHeaderProps) {
    return (
        <div className={`flex items-center w-full p-4 mb-2 border rounded-lg bg-gray-50 dark:bg-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider ${className}`}>
            {/* Checkbox spacer when selection mode is active */}
            {selectionMode && <div className="w-10 flex-shrink-0" />}

            {columns.map(col => (
                <div
                    key={col.key}
                    className={`${col.width} ${
                        col.align === 'center' ? 'text-center' :
                            col.align === 'right' ? 'text-right' : 'text-left'
                    }`}
                >
                    {col.label}
                </div>
            ))}
        </div>
    );
}