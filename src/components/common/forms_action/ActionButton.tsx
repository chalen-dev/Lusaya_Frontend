import React from 'react';

type ButtonVariant = 'purple' | 'blue' | 'green' | 'orange' | 'red' | 'yellow' | 'teal' | 'gray';

interface ActionButtonProps {
    onClick: () => void;
    disabled?: boolean;
    variant: ButtonVariant;
    icon?: string; // FontAwesome icon name (without 'fa-' prefix)
    count?: number;
    children: React.ReactNode;
    className?: string;
}

const variantClasses: Record<ButtonVariant, { enabled: string; disabled: string }> = {
    purple: {
        enabled: 'bg-purple-600 text-white hover:bg-purple-700',
        disabled: 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed',
    },
    blue: {
        enabled: 'bg-blue-500 text-white hover:bg-blue-600',
        disabled: 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed',
    },
    green: {
        enabled: 'bg-green-500 text-white hover:bg-green-600',
        disabled: 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed',
    },
    orange: {
        enabled: 'bg-orange-500 text-white hover:bg-orange-600',
        disabled: 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed',
    },
    red: {
        enabled: 'bg-red-500 text-white hover:bg-red-600',
        disabled: 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed',
    },
    yellow: {
        enabled: 'bg-yellow-500 text-white hover:bg-yellow-600',
        disabled: 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed',
    },
    teal: {
        enabled: 'bg-teal-500 text-white hover:bg-teal-600',
        disabled: 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed',
    },
    gray: {
        enabled: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600',
        disabled: 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed',
    },
};

export const ActionButton: React.FC<ActionButtonProps> = ({
                                                              onClick,
                                                              disabled = false,
                                                              variant,
                                                              icon,
                                                              count,
                                                              children,
                                                              className = '',
                                                          }) => {
    const isEnabled = !disabled;
    const baseClasses = 'px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
    const variantClass = isEnabled ? variantClasses[variant].enabled : variantClasses[variant].disabled;
    const focusRingColor = isEnabled ? `focus:ring-${variant}-500` : 'focus:ring-gray-500';

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${variantClass} ${focusRingColor} ${className}`}
        >
            {icon && <i className={`fas fa-${icon} mr-2`} />}
            {children}
            {count !== undefined && count > 0 && ` (${count})`}
        </button>
    );
};