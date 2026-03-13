// components/common/input/DateInput.tsx
import React from 'react';
import { Text } from './Text';

interface DateProps {
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    id?: string;
    label?: string;
    disabled?: boolean;
    required?: boolean;
    error?: string;
    className?: string;      // container margin
    inputClassName?: string;  // input padding
    min?: string;            // min date (YYYY-MM-DD)
    max?: string;            // max date
}

export const DateInput: React.FC<DateProps> = ({
                                                   name,
                                                   value,
                                                   onChange,
                                                   id,
                                                   label = 'Date',
                                                   disabled,
                                                   required,
                                                   error,
                                                   className,
                                                   inputClassName = 'dark:[&::-webkit-calendar-picker-indicator]:invert', // default dark mode fix
                                                   min,
                                                   max,
                                               }) => {
    return (
        <Text
            type="date"
            name={name}
            value={value}
            onChange={onChange}
            id={id}
            label={label}
            disabled={disabled}
            required={required}
            error={error}
            className={className}
            inputClassName={inputClassName}
            min={min}
            max={max}
        />
    );
};