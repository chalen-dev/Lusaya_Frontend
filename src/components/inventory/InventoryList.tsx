import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import axios from 'axios';
import { useHeaderTitle } from "../../contexts/HeaderTitleContext.tsx";
import { InventoryCard } from "./partials/InventoryCard";
import { InventoryForm } from "./forms/InventoryForm";
import { InventorySearchForm } from "./forms/InventorySearchForm";
import { InventoryActionForm } from "./forms/InventoryActionForm";
import { InventoryShowModal } from "./partials/InventoryShowModal";
import { FetchingDetails } from "../common/loading/FetchingDetails";
import { Pagination } from "../common/Pagination";
import { showToast, showConfirmation } from '../../utils/swalHelpers';
import { TabBar } from "../common/TabBar";
import { type Column, TableHeader } from "../common/TableHeader";
import type { InventoryLog, MenuItem } from "./inventoryTypes";

// Types for sort and filter
type SortField = 'name' | 'quantity' | 'date_acquired' | 'expiry_date';
type SortOrder = 'asc' | 'desc';
type AvailabilityFilter = 'all' | 'available' | 'unavailable';

export function InventoryList() {
    const { setTitle } = useHeaderTitle();
    const queryClient = useQueryClient();
    const tabBarRef = useRef<HTMLDivElement>(null);

    const {
        data: inventoryLogs = [],
        isLoading,
        error: queryError
    } = useQuery({
        queryKey: ['inventory-logs'],
        queryFn: async () => {
            const response = await api.get<InventoryLog[]>('/inventory-logs');
            return response.data;
        },
    });

    const {
        data: menuItems = [],
        isLoading: menuItemsLoading
    } = useQuery({
        queryKey: ['menu-items'],
        queryFn: async () => {
            const response = await api.get<MenuItem[]>('/menu-items');
            return response.data;
        },
    });

    const [headerTopOffset, setHeaderTopOffset] = useState(160);

    // UI state for sticky top bar
    const [activeTab, setActiveTab] = useState<'forms' | 'search' | 'select'>('forms');
    const [contentExpanded, setContentExpanded] = useState(false);
    const [editingLog, setEditingLog] = useState<InventoryLog | null>(null);

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(new Set());
    const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>('all');
    const [sortBy, setSortBy] = useState<SortField>('date_acquired');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

    // Selection mode states
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    // View mode state (for modal)
    const [viewingLogId, setViewingLogId] = useState<number | null>(null);

    // Pagination (client-side)
    const [page, setPage] = useState(1);
    const perPage = 25;

    useEffect(() => {
        setTitle('Inventory List');
    }, [setTitle]);

    // ResizeObserver for sticky header
    useEffect(() => {
        if (!tabBarRef.current) return;
        const observer = new ResizeObserver(entries => {
            for (const entry of entries) {
                setHeaderTopOffset(50 + entry.contentRect.height);
            }
        });
        observer.observe(tabBarRef.current);
        return () => observer.disconnect();
    }, []);

    // Filtered and sorted logs
    const filteredLogs = inventoryLogs
        .filter(log => {
            const term = searchTerm.toLowerCase();
            const itemName = log.menu_item?.name?.toLowerCase() || '';
            const itemCode = log.menu_item?.code?.toLowerCase() || '';
            const matchesSearch = !searchTerm || itemName.includes(term) || itemCode.includes(term);

            const matchesStatus = selectedStatuses.size === 0 || (log.inventory_status && selectedStatuses.has(log.inventory_status));

            const matchesAvailability =
                availabilityFilter === 'all' ||
                (availabilityFilter === 'available' && log.is_available) ||
                (availabilityFilter === 'unavailable' && !log.is_available);

            return matchesSearch && matchesStatus && matchesAvailability;
        })
        .sort((a, b) => {
            const getCompareValue = (log: InventoryLog, field: SortField): number | string => {
                switch (field) {
                    case 'name':
                        return log.menu_item?.name || '';
                    case 'quantity':
                        return log.quantity_in_stock;
                    case 'date_acquired':
                        return log.date_acquired ? new Date(log.date_acquired).getTime() : 0;
                    case 'expiry_date':
                        return log.expiry_date ? new Date(log.expiry_date).getTime() : 0;
                    default:
                        return 0;
                }
            };

            const aVal = getCompareValue(a, sortBy);
            const bVal = getCompareValue(b, sortBy);

            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            } else {
                const aNum = aVal as number;
                const bNum = bVal as number;
                return sortOrder === 'asc' ? aNum - bNum : bNum - aNum;
            }
        });

    // Reset page when filters change
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPage(1);
    }, [searchTerm, selectedStatuses, availabilityFilter, sortBy, sortOrder]);

    // Paginated items
    const totalPages = Math.ceil(filteredLogs.length / perPage);
    const paginatedItems = filteredLogs.slice((page - 1) * perPage, page * perPage);

    // Mutations
    const deleteMutation = useMutation({
        mutationFn: (id: number) => api.delete(`/inventory-logs/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory-logs'] });
            showToast('Inventory record deleted successfully', 'success');
        },
        onError: (error) => {
            const message = axios.isAxiosError(error)
                ? error.response?.data?.message || error.message
                : 'Delete failed';
            showToast(message, 'error');
        },
    });

    const bulkDeleteMutation = useMutation({
        mutationFn: (ids: number[]) => api.post('/inventory-logs/bulk-delete', { ids }),
        onSuccess: (_, ids) => {
            queryClient.invalidateQueries({ queryKey: ['inventory-logs'] });
            setSelectedIds(new Set());
            setSelectionMode(false);
            showToast(`${ids.length} item(s) deleted successfully`, 'success');
        },
        onError: (error) => {
            const message = axios.isAxiosError(error)
                ? error.response?.data?.message || error.message
                : 'Bulk delete failed';
            showToast(message, 'error');
        },
    });

    const toggleAvailabilityMutation = useMutation({
        mutationFn: ({ id, is_available }: { id: number; is_available: boolean }) =>
            api.patch(`/inventory-logs/${id}/toggle-availability`, { is_available }),
        onSuccess: (_, { is_available }) => {
            queryClient.invalidateQueries({ queryKey: ['inventory-logs'] });
            showToast(`Item marked as ${is_available ? 'available' : 'unavailable'}`, 'success');
        },
        onError: (error) => {
            const message = axios.isAxiosError(error)
                ? error.response?.data?.message || error.message
                : 'Failed to update availability';
            showToast(message, 'error');
        },
    });

    const bulkToggleMutation = useMutation({
        mutationFn: ({ ids, is_available }: { ids: number[]; is_available: boolean }) =>
            api.post('/inventory-logs/bulk-toggle-availability', { ids, is_available }),
        onSuccess: (_, { is_available }) => {
            queryClient.invalidateQueries({ queryKey: ['inventory-logs'] });
            setSelectedIds(new Set());
            setSelectionMode(false);
            showToast(`${selectedIds.size} item(s) marked as ${is_available ? 'available' : 'unavailable'}`, 'success');
        },
        onError: (error) => {
            const message = axios.isAxiosError(error)
                ? error.response?.data?.message || error.message
                : 'Bulk update failed';
            showToast(message, 'error');
        },
    });

    const updateQuantityMutation = useMutation({
        mutationFn: ({ id, quantity }: { id: number; quantity: number }) =>
            api.patch(`/inventory-logs/${id}/quantity`, { quantity_in_stock: quantity }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['inventory-logs'] });
            showToast('Quantity updated successfully', 'success');
        },
        onError: (error) => {
            const message = axios.isAxiosError(error)
                ? error.response?.data?.message || error.message
                : 'Failed to update quantity';
            showToast(message, 'error');
        },
    });

    // Handlers
    const handleEdit = (log: InventoryLog) => {
        setEditingLog(log);
        setActiveTab('forms');
        setContentExpanded(true);
    };

    const handleCancelEdit = () => setEditingLog(null);

    const handleView = (id: number) => setViewingLogId(id);

    const handleItemAdded = (action: 'add' | 'update') => {
        queryClient.invalidateQueries({ queryKey: ['inventory-logs'] });
        showToast(action === 'add' ? 'Inventory record added successfully' : 'Inventory record updated successfully', 'success');
        setEditingLog(null);
    };

    const handleDelete = async (id: number) => {
        const confirmed = await showConfirmation(
            'Confirm Delete',
            'Are you sure you want to delete this inventory record?',
            'warning',
            'Yes, delete'
        );
        if (!confirmed) return;
        deleteMutation.mutate(id);
    };

    const handleToggleAvailability = (id: number, currentAvailability: boolean) => {
        toggleAvailabilityMutation.mutate({ id, is_available: !currentAvailability });
    };

    const handleStatusToggle = (status: string) => {
        setSelectedStatuses(prev => {
            const newSet = new Set(prev);
            if (newSet.has(status)) newSet.delete(status);
            else newSet.add(status);
            return newSet;
        });
    };

    const handleAvailabilityChange = (filter: AvailabilityFilter) => setAvailabilityFilter(filter);

    const handleSortChange = (by: SortField, order: SortOrder) => {
        setSortBy(by);
        setSortOrder(order);
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setSelectedStatuses(new Set());
        setAvailabilityFilter('all');
        setSortBy('date_acquired');
        setSortOrder('asc');
    };

    // Selection handlers
    const toggleSelectionMode = () => {
        if (selectionMode) setSelectedIds(new Set());
        setSelectionMode(!selectionMode);
    };

    const handleSelectAll = () => setSelectedIds(new Set(paginatedItems.map(log => log.id)));

    const handleToggleItemSelection = (id: number) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.size === 0) {
            showToast('No items selected', 'info');
            return;
        }
        const confirmed = await showConfirmation(
            'Confirm Bulk Delete',
            `Are you sure you want to delete ${selectedIds.size} item(s)?`,
            'warning',
            'Yes, delete'
        );
        if (!confirmed) return;
        bulkDeleteMutation.mutate(Array.from(selectedIds));
    };

    const handleMarkAvailable = async () => {
        if (selectedIds.size === 0) {
            showToast('No items selected', 'info');
            return;
        }
        const confirmed = await showConfirmation(
            'Confirm Bulk Update',
            `Are you sure you want to mark ${selectedIds.size} item(s) as available?`,
            'question',
            'Yes, mark available'
        );
        if (!confirmed) return;
        bulkToggleMutation.mutate({ ids: Array.from(selectedIds), is_available: true });
    };

    const handleMarkUnavailable = async () => {
        if (selectedIds.size === 0) {
            showToast('No items selected', 'info');
            return;
        }
        const confirmed = await showConfirmation(
            'Confirm Bulk Update',
            `Are you sure you want to mark ${selectedIds.size} item(s) as unavailable?`,
            'question',
            'Yes, mark unavailable'
        );
        if (!confirmed) return;
        bulkToggleMutation.mutate({ ids: Array.from(selectedIds), is_available: false });
    };

    const handleUpdateQuantity = async (id: number, newQuantity: number) => {
        updateQuantityMutation.mutate({ id, quantity: newQuantity });
    };

    const goToPage = (newPage: number) => setPage(newPage);

    if (isLoading) return <FetchingDetails />;
    if (queryError) return <div className="p-4 text-red-600 dark:text-red-400">Error: {(queryError as Error).message}</div>;

    const inventoryColumns: Column[] = [
        { key: 'id', label: 'ID', width: selectionMode ? 'w-20' : 'w-16' },
        { key: 'item', label: 'Item', width: 'flex-1' },
        { key: 'price', label: 'Price', width: 'w-20', align: 'center' },
        { key: 'qty', label: 'Qty', width: 'w-16', align: 'center' },
        { key: 'acquired', label: 'Acquired', width: 'w-28', align: 'center' },
        { key: 'expires', label: 'Expires', width: 'w-28', align: 'center' },
        { key: 'status', label: 'Status', width: 'w-24', align: 'center' },
        { key: 'avail', label: 'Avail.', width: 'w-20', align: 'center' },
        { key: 'actions', label: 'Actions', width: 'w-36', align: 'right' },
    ];

    return (
        <div className="inventory-list-container">
            {/* Sticky top bar with tabs */}
            <div
                ref={tabBarRef}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 mb-8 sticky top-[50px] z-20 ${
                    contentExpanded ? 'p-6' : 'pt-6 px-6 pb-2'
                }`}
            >
                <TabBar
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    contentExpanded={contentExpanded}
                    onToggleExpand={() => setContentExpanded(!contentExpanded)}
                    isEditing={!!editingLog}
                    formsLabel={editingLog ? 'Edit Inventory' : 'Add Inventory'}
                    searchLabel="Search and Filter"
                    selectLabel="Actions"
                    onFormsTabSelected={() => setEditingLog(null)}
                />

                {contentExpanded && (
                    <>
                        {activeTab === 'forms' && (
                            <InventoryForm
                                onItemAdded={handleItemAdded}
                                onCancel={handleCancelEdit}
                                noCard={true}
                                editingItem={editingLog}
                                menuItems={menuItems}
                                menuItemsLoading={menuItemsLoading}
                            />
                        )}
                        {activeTab === 'search' && (
                            <InventorySearchForm
                                searchTerm={searchTerm}
                                onSearchChange={setSearchTerm}
                                selectedStatuses={selectedStatuses}
                                onStatusToggle={handleStatusToggle}
                                availabilityFilter={availabilityFilter}
                                onAvailabilityChange={handleAvailabilityChange}
                                sortBy={sortBy}
                                sortOrder={sortOrder}
                                onSortChange={handleSortChange}
                                onReset={handleResetFilters}
                            />
                        )}
                        {activeTab === 'select' && (
                            <InventoryActionForm
                                selectionMode={selectionMode}
                                onToggleMode={toggleSelectionMode}
                                onSelectAll={handleSelectAll}
                                onDeleteSelected={handleDeleteSelected}
                                onMarkAvailable={handleMarkAvailable}
                                onMarkUnavailable={handleMarkUnavailable}
                                selectedCount={selectedIds.size}
                            />
                        )}
                    </>
                )}
            </div>

            {/* Header row – using filteredLogs */}
            {filteredLogs.length > 0 && (
                <TableHeader
                    columns={inventoryColumns}
                    selectionMode={selectionMode}
                    className="sticky z-10"
                    style={{ top: `${headerTopOffset}px` }}
                />
            )}

            {/* Inventory logs grid – using paginatedItems */}
            <div className="cards-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.1rem' }}>
                {paginatedItems.map(log => (
                    <InventoryCard
                        key={log.id}
                        log={log}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                        onView={handleView}
                        onToggleAvailability={handleToggleAvailability}
                        selectionMode={selectionMode}
                        isSelected={selectedIds.has(log.id)}
                        onToggleSelection={handleToggleItemSelection}
                        onUpdateQuantity={handleUpdateQuantity}
                    />
                ))}
                {filteredLogs.length === 0 && !isLoading && (
                    <div className="w-full text-center py-8 text-gray-500 dark:text-gray-400">
                        No inventory records match your filters.
                    </div>
                )}
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={goToPage}
                    disabled={isLoading}
                />
            )}

            {/* Show modal */}
            {viewingLogId && (
                <InventoryShowModal
                    logId={viewingLogId}
                    onClose={() => setViewingLogId(null)}
                />
            )}
        </div>
    );
}