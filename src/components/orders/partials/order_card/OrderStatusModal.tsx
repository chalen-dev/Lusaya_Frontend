// components/orders/partials/OrderStatusModal.tsx
import { useState } from 'react';
import { ORDER_STATUS_OPTIONS } from "../../orderTypes";

interface OrderStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentStatus: string;
    orderId: number;
    onStatusChange: (orderId: number, newStatus: string) => Promise<void>;
}

const statusColorMap: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    preparing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    ready: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    completed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
};

export function OrderStatusModal({
                                     isOpen,
                                     onClose,
                                     currentStatus,
                                     orderId,
                                     onStatusChange
                                 }: OrderStatusModalProps) {
    const [selectedStatus, setSelectedStatus] = useState(currentStatus);
    const [updating, setUpdating] = useState(false);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        if (selectedStatus === currentStatus) {
            onClose();
            return;
        }
        setUpdating(true);
        try {
            await onStatusChange(orderId, selectedStatus);
            onClose();
        } catch (error) {
            console.error('Failed to update status:', error);
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Change Order Status</h2>
                    <button onClick={onClose} className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Current status:
                        <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${statusColorMap[currentStatus] || 'bg-gray-100 text-gray-800'}`}>
                            {ORDER_STATUS_OPTIONS.find(opt => opt.value === currentStatus)?.label || currentStatus}
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {ORDER_STATUS_OPTIONS.map(option => {
                            const isCurrent = option.value === currentStatus;
                            const isSelected = option.value === selectedStatus;
                            return (
                                <button
                                    key={option.value}
                                    onClick={() => setSelectedStatus(option.value)}
                                    disabled={updating}
                                    className={`px-3 py-1.5 text-sm font-medium rounded-full transition-all ${
                                        isSelected
                                            ? 'ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-800'
                                            : 'hover:opacity-80'
                                    } ${statusColorMap[option.value] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}
                                >
                                    {option.label}
                                    {isCurrent && !isSelected && (
                                        <span className="ml-1 text-xs opacity-75">(current)</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={updating}
                            className="px-4 py-2 bg-gray-500 text-white text-sm font-medium rounded-lg hover:bg-gray-600 disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={updating || selectedStatus === currentStatus}
                            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark disabled:opacity-50"
                        >
                            {updating ? 'Updating...' : 'Update Status'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}