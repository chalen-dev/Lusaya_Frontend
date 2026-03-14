import React from 'react';

interface DetailCardProps {
    label: string;
    value: React.ReactNode;
    className?: string;
}

export const DetailCard: React.FC<DetailCardProps> = ({ label, value, className = '' }) => {
    return (
        <div className={`bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg ${className}`}>
            <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-0.5">
                {label}
            </p>
            <div className="text-base font-medium text-gray-900 dark:text-white">
                {value}
            </div>
        </div>
    );
};