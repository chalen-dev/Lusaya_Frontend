import React from 'react';

interface StatusBadgeProps {
    status: string;
    label?: string;
    colorMap?: Record<string, string>;
}

const defaultColorMap: Record<string, string> = {
    in_stock: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    low_stock: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    out_of_stock: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    expired: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
                                                            status,
                                                            label,
                                                            colorMap = defaultColorMap,
                                                        }) => {
    const color = colorMap[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    const displayLabel = label || status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    return (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${color}`}>
            {displayLabel}
        </span>
    );
};