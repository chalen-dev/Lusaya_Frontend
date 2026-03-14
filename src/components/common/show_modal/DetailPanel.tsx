import React from 'react';

interface DetailPanelProps {
    label: string;
    children?: React.ReactNode;
    value?: React.ReactNode; // alternative to children for simple text
    className?: string; // for the value container
}

export const DetailPanel: React.FC<DetailPanelProps> = ({
                                                            label,
                                                            children,
                                                            value,
                                                            className = '',
                                                        }) => {
    return (
        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
            <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-0.5">
                {label}
            </p>
            <div className={className}>
                {children !== undefined ? children : value}
            </div>
        </div>
    );
};