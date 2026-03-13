// InventoryShowModal.tsx
import { useEffect, useState } from 'react';
import api from '../../../services/api';
import axios from 'axios';
import { type InventoryLog } from '../inventoryTypes';
import { LoadingSpinner } from '../../common/loading/LoadingSpinner';

interface InventoryShowModalProps {
    logId: number | null;
    onClose: () => void;
}

export function InventoryShowModal({ logId, onClose }: InventoryShowModalProps) {
    const [log, setLog] = useState<InventoryLog | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!logId) return;
        const fetchLog = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api.get<InventoryLog>(`/inventory-logs/${logId}`);
                setLog(response.data);
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    setError(err.response?.data?.message || err.message);
                } else {
                    setError('Failed to load inventory details');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchLog();
    }, [logId]);

    if (!logId) return null;

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '—';
        return new Date(dateString).toLocaleDateString();
    };

    const getStatusBadge = (status: string | null) => {
        const statusMap: Record<string, { color: string; label: string }> = {
            in_stock: { color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', label: 'In Stock' },
            low_stock: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', label: 'Low Stock' },
            out_of_stock: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', label: 'Out of Stock' },
            expired: { color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', label: 'Expired' },
        };
        const defaultStatus = { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', label: status || 'Unknown' };
        const { color, label } = statusMap[status || ''] || defaultStatus;
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${color}`}>{label}</span>;
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Inventory Record Details
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Close"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-64px)]">
                    {loading && (
                        <div className="flex justify-center py-8">
                            <LoadingSpinner size={32} />
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-300">
                            {error}
                        </div>
                    )}

                    {log && !loading && !error && (
                        <div className="space-y-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                {/* Left side - inventory details */}
                                <div className="flex-1 space-y-3">
                                    {/* First row: ID and basic info */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                            <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-0.5">ID</p>
                                            <p className="text-base font-mono font-semibold text-gray-900 dark:text-white">#{log.id}</p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                            <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-0.5">Menu Item</p>
                                            <p className="text-base font-medium text-gray-900 dark:text-white">
                                                {log.menu_item?.name || 'Unknown'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Menu item code and price (if available) */}
                                    {log.menu_item && (
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                                <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-0.5">Code</p>
                                                <p className="text-base font-mono text-gray-900 dark:text-white">{log.menu_item.code || '—'}</p>
                                            </div>
                                            <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                                <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-0.5">Price</p>
                                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                    ₱{Number(log.menu_item.price).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Inventory-specific fields */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                            <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-0.5">Quantity</p>
                                            <p className="text-base font-semibold text-gray-900 dark:text-white">{log.quantity_in_stock}</p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                            <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-0.5">Status</p>
                                            <div className="mt-1">{getStatusBadge(log.inventory_status)}</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                            <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-0.5">Date Acquired</p>
                                            <p className="text-base text-gray-900 dark:text-white">{formatDate(log.date_acquired)}</p>
                                        </div>
                                        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                            <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-0.5">Expiry Date</p>
                                            <p className="text-base text-gray-900 dark:text-white">{formatDate(log.expiry_date)}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                            <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-0.5">Availability</p>
                                            <p className={`text-base font-medium ${log.is_available ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                                {log.is_available ? 'Available' : 'Unavailable'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    {log.description && (
                                        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                            <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Description</p>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                                {log.description}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Right side - menu item image (if exists) */}
                                {log.menu_item?.image_url && (
                                    <div className="md:w-64 flex-shrink-0">
                                        <div className="sticky top-0">
                                            <img
                                                src={log.menu_item.image_url}
                                                alt={log.menu_item.name}
                                                className="w-full h-auto rounded-lg object-cover shadow-md"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Timestamps */}
                            {log.created_at && (
                                <div className="text-xs text-gray-400 dark:text-gray-500 pt-3 border-t border-gray-200 dark:border-gray-700">
                                    Created: {new Date(log.created_at).toLocaleString()}
                                    {log.updated_at && log.updated_at !== log.created_at && (
                                        <> · Updated: {new Date(log.updated_at).toLocaleString()}</>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}