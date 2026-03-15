import React from 'react';

interface NumericKeypadProps {
    onKeyPress: (key: string) => void;
    disabled?: boolean;
}

export const NumericKeypad: React.FC<NumericKeypadProps> = ({ onKeyPress, disabled = false }) => {
    const keys = [
        ['7', '8', '9'],
        ['4', '5', '6'],
        ['1', '2', '3'],
        ['0', '.', '⌫'],
        ['C', '00']
    ];

    return (
        <div className="grid grid-cols-3 gap-2 mt-2">
            {keys.flat().map((key) => (
                <button
                    key={key}
                    onClick={() => onKeyPress(key)}
                    disabled={disabled}
                    className={`
                        py-3 text-lg font-semibold rounded-lg transition-colors
                        ${key === '⌫' || key === 'C' || key === '00'
                        ? 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200'
                        : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                    }
                        disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                >
                    {key}
                </button>
            ))}
        </div>
    );
};