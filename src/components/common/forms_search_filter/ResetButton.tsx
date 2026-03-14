import React from 'react';

interface ResetButtonProps {
    onClick: () => void;
    className?: string;
}

export const ResetButton: React.FC<ResetButtonProps> = ({ onClick, className = '' }) => {
    return (
        <div className="flex justify-end">
            <button
                onClick={onClick}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${className}`}
            >
                <i className="fas fa-undo" />
                Reset Filters
            </button>
        </div>
    );
};