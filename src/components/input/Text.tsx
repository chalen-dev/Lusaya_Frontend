import React from 'react';

type Props = {
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    id?: string;
    label?: string;
    type?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    error?: string;            // new prop for error message
    className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const Text = ({
                         name,
                         value,
                         onChange,
                         id,
                         label = 'Input Label',
                         type = 'text',
                         placeholder,
                         disabled,
                         required,
                         error,
                         className = '',
                         ...rest
                     }: Props) => {
    const inputId = id || name;

    return (
        <div className={`mb-5 ${className}`}>
            {label && (
                <label htmlFor={inputId} className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                </label>
            )}
            <input
                type={type}
                id={inputId}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                disabled={disabled}
                required={required}
                className={`w-full px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border rounded outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-gray-100 dark:disabled:bg-gray-800/50 disabled:cursor-not-allowed ${
                    error ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-700'
                }`}
                aria-invalid={!!error}
                aria-describedby={error ? `${inputId}-error` : undefined}
                {...rest}
            />
            {error && (
                <p id={`${inputId}-error`} className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {error}
                </p>
            )}
        </div>
    );
};