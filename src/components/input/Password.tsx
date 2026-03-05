import React, { useState } from 'react';

type PasswordProps = {
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    id?: string;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'>;

export const Password = ({
                             name,
                             value,
                             onChange,
                             id,
                             label = 'Password',
                             placeholder,
                             disabled,
                             required,
                             className = '',
                             ...rest
                         }: PasswordProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || name;

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    return (
        <div className={`mb-5 ${className}`}>
            {label && (
                <label htmlFor={inputId} className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    type={showPassword ? 'text' : 'password'}
                    id={inputId}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    className="w-full px-3 py-2 pr-10 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:bg-gray-100 dark:disabled:bg-gray-800/50 disabled:cursor-not-allowed"
                    {...rest}
                />
                <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    disabled={disabled}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                    <span className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} aria-hidden="true" />
                </button>
            </div>
        </div>
    );
};