import React from 'react';

interface SearchHeaderProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    showAdvanced: boolean;
    onToggleAdvanced: () => void;
    className?: string;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
                                                              value,
                                                              onChange,
                                                              placeholder = 'Search...',
                                                              showAdvanced,
                                                              onToggleAdvanced,
                                                              className = '',
                                                          }) => {
    return (
        <div className={`flex gap-2 ${className}`}>
            <input
                type="text"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                autoFocus
            />
            <button
                type="button"
                onClick={onToggleAdvanced}
                className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                title={showAdvanced ? 'Hide advanced filters' : 'Show advanced filters'}
            >
                <i className={`fas fa-${showAdvanced ? 'chevron-up' : 'sliders-h'}`} />
            </button>
        </div>
    );
};