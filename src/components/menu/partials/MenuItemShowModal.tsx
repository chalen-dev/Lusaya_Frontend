import { useEffect, useState } from 'react';
import api from '../../../services/api.ts';
import axios from 'axios';
import { type MenuItem } from '../menuTypes.ts';
import { LoadingSpinner } from '../../common/loading/LoadingSpinner.tsx';

interface MenuItemShowModalProps {
    itemId: number | null;
    onClose: () => void;
}

export function MenuItemShowModal({ itemId, onClose }: MenuItemShowModalProps) {
    const [item, setItem] = useState<MenuItem | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!itemId) return;
        const fetchItem = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await api.get<MenuItem>(`/menu-items/${itemId}`);
                setItem(response.data);
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    setError(err.response?.data?.message || err.message);
                } else {
                    setError('Failed to load item details');
                }
            } finally {
                setLoading(false);
            }
        };
        fetchItem();
    }, [itemId]);

    if (!itemId) return null;

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
                        Menu Item Details
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

                    {item && !loading && !error && (
                        <div className="space-y-4">
                            {/* Main row: details left, image right */}
                            <div className="flex flex-col md:flex-row gap-4">
                                {/* Left side - details */}
                                <div className="flex-1 space-y-3">
                                    {/* Four fields in a grid */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                            <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-0.5">ID</p>
                                            <p className="text-base font-mono font-semibold text-gray-900 dark:text-white">#{item.id}</p>
                                        </div>

                                        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                            <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-0.5">Code</p>
                                            <p className="text-base font-mono font-semibold text-gray-900 dark:text-white">{item.code}</p>
                                        </div>

                                        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                            <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-0.5">Category</p>
                                            <p className="text-base font-medium text-gray-900 dark:text-white">
                                                {item.category?.name || 'Uncategorized'}
                                            </p>
                                        </div>

                                        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                            <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-0.5">Price</p>
                                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                                                ₱{Number(item.price).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Name - full width */}
                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                        <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-0.5">Name</p>
                                        <p className="text-base font-semibold text-gray-900 dark:text-white">{item.name}</p>
                                    </div>

                                    {/* Description - full width */}
                                    {item.description && (
                                        <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                                            <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Description</p>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                                {item.description}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Right side - image (only if exists) */}
                                {item.image_url && (
                                    <div className="md:w-64 flex-shrink-0">
                                        <div className="sticky top-0">
                                            <img
                                                src={item.image_url}
                                                alt={item.name}
                                                className="w-full h-auto rounded-lg object-cover shadow-md"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Timestamps */}
                            {item.created_at && (
                                <div className="text-xs text-gray-400 dark:text-gray-500 pt-3 border-t border-gray-200 dark:border-gray-700">
                                    Created: {new Date(item.created_at).toLocaleString()}
                                    {item.updated_at && item.updated_at !== item.created_at && (
                                        <> · Updated: {new Date(item.updated_at).toLocaleString()}</>
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