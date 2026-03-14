import { useEffect, useState } from 'react';
import api from '../../../services/api';
import axios from 'axios';
import { type InventoryLog } from '../inventoryTypes';
import { LoadingSpinner } from '../../common/loading/LoadingSpinner';
import {DetailGrid} from "../../common/show_modal/DetailGrid.tsx";
import {DetailCard} from "../../common/show_modal/DetailCard.tsx";
import {StatusBadge} from "../../common/show_modal/StatusBadge.tsx";


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
                                    <DetailGrid cols={2}>
                                        <DetailCard label="ID" value={`#${log.id}`} />
                                        <DetailCard label="Menu Item" value={log.menu_item?.name || 'Unknown'} />
                                    </DetailGrid>

                                    {log.menu_item && (
                                        <DetailGrid cols={2}>
                                            <DetailCard label="Code" value={log.menu_item.code || '—'} />
                                            <DetailCard label="Price" value={`₱${Number(log.menu_item.price).toFixed(2)}`} />
                                        </DetailGrid>
                                    )}

                                    <DetailGrid cols={2}>
                                        <DetailCard label="Quantity" value={log.quantity_in_stock} />
                                        <DetailCard
                                            label="Status"
                                            value={<StatusBadge status={log.inventory_status || 'unknown'} />}
                                        />
                                    </DetailGrid>

                                    <DetailGrid cols={2}>
                                        <DetailCard label="Date Acquired" value={formatDate(log.date_acquired)} />
                                        <DetailCard label="Expiry Date" value={formatDate(log.expiry_date)} />
                                    </DetailGrid>

                                    <DetailCard
                                        label="Availability"
                                        value={
                                            log.is_archived ? (
                                                <span className="text-gray-500 dark:text-gray-400">Archived</span>
                                            ) : (
                                                <span className={log.is_available ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}>
                                                    {log.is_available ? 'Available' : 'Unavailable'}
                                                </span>
                                            )
                                        }
                                    />

                                    {log.description && (
                                        <DetailCard
                                            label="Description"
                                            value={
                                                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                                    {log.description}
                                                </p>
                                            }
                                        />
                                    )}
                                </div>

                                {/* Right side - menu item image */}
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