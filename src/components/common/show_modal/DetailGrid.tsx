import React from 'react';

interface DetailGridProps {
    children: React.ReactNode;
    cols?: 1 | 2 | 3 | 4;
    className?: string;
}

export const DetailGrid: React.FC<DetailGridProps> = ({
                                                          children,
                                                          cols = 2,
                                                          className = ''
                                                      }) => {
    const gridCols = {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
    }[cols];

    return (
        <div className={`grid ${gridCols} gap-3 ${className}`}>
            {children}
        </div>
    );
};