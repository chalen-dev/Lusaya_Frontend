import React from 'react';
import {LoadingSpinner} from "../loading/LoadingSpinner.tsx";

interface SubmitButtonProps {
    submitting: boolean;
    isEditing: boolean;
    disabled?: boolean;
    className?: string;
    addLabel?: string;
    updateLabel?: string;
    submittingAddLabel?: string;
    submittingUpdateLabel?: string;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
                                                              submitting,
                                                              isEditing,
                                                              disabled = false,
                                                              className = '',
                                                              addLabel = 'Add',
                                                              updateLabel = 'Update',
                                                              submittingAddLabel = 'Adding...',
                                                              submittingUpdateLabel = 'Updating...',
                                                          }) => {
    const label = submitting
        ? (isEditing ? submittingUpdateLabel : submittingAddLabel)
        : (isEditing ? updateLabel : addLabel);

    return (
        <button
            type="submit"
            disabled={submitting || disabled}
            className={`px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm ${className}`}
        >
            {submitting ? (
                <span className="flex items-center gap-2">
                    <LoadingSpinner size={20} />
                    {label}
                </span>
            ) : (
                label
            )}
        </button>
    );
};