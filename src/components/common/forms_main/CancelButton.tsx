import React from 'react';

interface CancelButtonProps {
    onClick: () => void;
    disabled?: boolean;
    label?: string; // if not provided, defaults to 'Cancel' (or 'Clear' if isEditing is false? Better to let parent pass label)
    className?: string;
}

export const CancelButton: React.FC<CancelButtonProps> = ({
                                                              onClick,
                                                              disabled = false,
                                                              label = 'Cancel',
                                                              className = '',
                                                          }) => {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`px-6 py-2.5 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm ${className}`}
        >
            {label}
        </button>
    );
};