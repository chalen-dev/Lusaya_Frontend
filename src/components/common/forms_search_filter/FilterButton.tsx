import React from 'react';

interface FilterButtonProps {
    isSelected?: boolean;
    onClick: () => void;
    children: React.ReactNode;
    className?: string;
}

export const FilterButton: React.FC<FilterButtonProps> = ({
                                                              isSelected = false,
                                                              onClick,
                                                              children,
                                                              className = '',
                                                          }) => {
    return (
        <button
            onClick={onClick}
            className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                isSelected
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            } ${className}`}
        >
            {children}
        </button>
    );
};