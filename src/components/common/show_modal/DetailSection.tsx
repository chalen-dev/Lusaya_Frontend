import React from 'react';

interface DetailSectionProps {
    title?: string;
    children: React.ReactNode;
    className?: string;
}

export const DetailSection: React.FC<DetailSectionProps> = ({
                                                                title,
                                                                children,
                                                                className = ''
                                                            }) => {
    return (
        <div className={`space-y-3 ${className}`}>
            {title && (
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {title}
                </h3>
            )}
            {children}
        </div>
    );
};