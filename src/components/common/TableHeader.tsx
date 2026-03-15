// components/common/TableHeader.tsx
export interface Column {
    key: string;
    label: string;
    width: string; // e.g. 'w-20', 'flex-1', 'w-28'
    align?: 'left' | 'center' | 'right';
}

interface TableHeaderProps {
    columns: Column[];
    selectionMode?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

export function TableHeader({ columns, selectionMode = false, className = '', style }: TableHeaderProps) {
    const headerColumns = selectionMode
        ? [{ key: '_selection', label: '', width: 'w-10', align: 'center' as const }, ...columns]
        : columns;

    return (
        <thead className={className} style={style}>
        <tr className="bg-gray-50 dark:bg-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
            {headerColumns.map(col => (
                <th
                    key={col.key}
                    className={`${col.width} px-4 py-3 ${
                        col.align === 'center' ? 'text-center' :
                            col.align === 'right' ? 'text-right' : 'text-left'
                    }`}
                >
                    {col.label}
                </th>
            ))}
        </tr>
        </thead>
    );
}