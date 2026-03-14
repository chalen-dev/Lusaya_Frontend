import { useState, useEffect, useMemo } from 'react';
import { Pagination } from '../../common/Pagination';
import type { InventoryLog } from '../../inventory/inventoryTypes';
import {
    type SortField,
    type SortOrder,
    type AvailabilityFilter,
    STATUS_OPTIONS,
} from '../../inventory/inventoryTypes';
import { FilterButton } from "../../common/forms_search_filter/FilterButton";
import { ActionButton } from "../../common/forms_action/ActionButton.tsx";
import { CancelButton } from "../../common/forms_main/CancelButton.tsx";
import { ResetButton } from "../../common/forms_search_filter/ResetButton.tsx";
import { SearchHeader } from "../../common/forms_search_filter/SearchHeader.tsx";

interface OrderItemSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (items: { inventoryId: number; quantity: number }[]) => void;
    existingSelections: { inventoryId: number; quantity: number }[];
    inventoryLogs: InventoryLog[];
}

export function OrderItemSelectorModal({
                                           isOpen,
                                           onClose,
                                           onSelect,
                                           existingSelections,
                                           inventoryLogs
                                       }: OrderItemSelectorModalProps) {
    // Filter and sort state
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatuses, setSelectedStatuses] = useState<Set<string>>(new Set());
    const [availabilityFilter, setAvailabilityFilter] = useState<AvailabilityFilter>('all');
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<number>>(new Set());
    const [sortBy, setSortBy] = useState<SortField>('name');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [page, setPage] = useState(1);
    const perPage = 10;

    // Selection state
    const [selectedItems, setSelectedItems] = useState<Map<number, number>>(new Map());

    // Exclude archived logs
    const availableLogs = useMemo(
        () => inventoryLogs.filter(log => !log.is_archived),
        [inventoryLogs]
    );

    // Get unique categories from available logs
    const categories = useMemo(() => {
        const categoryMap = new Map<number, { id: number; name: string }>();
        availableLogs.forEach(log => {
            const cat = log.menu_item?.category;
            if (cat && !categoryMap.has(cat.id)) {
                categoryMap.set(cat.id, { id: cat.id, name: cat.name });
            }
        });
        return Array.from(categoryMap.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [availableLogs]);

    // Initialize selected items from existingSelections
    useEffect(() => {
        const map = new Map();
        existingSelections.forEach(({ inventoryId, quantity }) => {
            map.set(inventoryId, quantity);
        });
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedItems(map);
    }, [existingSelections]);

    // Reset page when filters change
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPage(1);
    }, [searchTerm, selectedStatuses, availabilityFilter, selectedCategoryIds, sortBy, sortOrder]);

    // Filter logs based on search term, status, availability, category
    const filteredLogs = useMemo(() => {
        return availableLogs.filter(log => {
            // Search term (includes name, code, category, status)
            const term = searchTerm.toLowerCase();
            const matchesSearch =
                !searchTerm ||
                log.menu_item?.name.toLowerCase().includes(term) ||
                log.menu_item?.code?.toLowerCase().includes(term) ||
                log.menu_item?.category?.name?.toLowerCase().includes(term) ||
                log.inventory_status?.toLowerCase().includes(term);

            // Status filter
            const matchesStatus =
                selectedStatuses.size === 0 ||
                (log.inventory_status && selectedStatuses.has(log.inventory_status));

            // Availability filter
            const matchesAvailability =
                availabilityFilter === 'all' ||
                (availabilityFilter === 'available' && log.is_available && log.quantity_in_stock > 0) ||
                (availabilityFilter === 'unavailable' && (!log.is_available || log.quantity_in_stock === 0));

            // Category filter
            const matchesCategory =
                selectedCategoryIds.size === 0 ||
                (log.menu_item?.category?.id && selectedCategoryIds.has(log.menu_item.category.id));

            return matchesSearch && matchesStatus && matchesAvailability && matchesCategory;
        });
    }, [availableLogs, searchTerm, selectedStatuses, availabilityFilter, selectedCategoryIds]);

    // Sort filtered logs
    const sortedLogs = useMemo(() => {
        return [...filteredLogs].sort((a, b) => {
            let aVal: string | number = '';
            let bVal: string | number = '';

            switch (sortBy) {
                case 'name':
                    aVal = a.menu_item?.name || '';
                    bVal = b.menu_item?.name || '';
                    break;
                case 'quantity':
                    aVal = a.quantity_in_stock;
                    bVal = b.quantity_in_stock;
                    break;
                case 'date_acquired':
                    aVal = a.date_acquired ? new Date(a.date_acquired).getTime() : 0;
                    bVal = b.date_acquired ? new Date(b.date_acquired).getTime() : 0;
                    break;
                case 'expiry_date':
                    aVal = a.expiry_date ? new Date(a.expiry_date).getTime() : 0;
                    bVal = b.expiry_date ? new Date(b.expiry_date).getTime() : 0;
                    break;
                default:
                    return 0;
            }

            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            } else {
                const aNum = aVal as number;
                const bNum = bVal as number;
                return sortOrder === 'asc' ? aNum - bNum : bNum - aNum;
            }
        });
    }, [filteredLogs, sortBy, sortOrder]);

    // Pagination
    const totalPages = Math.ceil(sortedLogs.length / perPage);
    const paginatedLogs = sortedLogs.slice((page - 1) * perPage, page * perPage);

    // Helper functions
    const isExpired = (log: InventoryLog) => {
        return log.inventory_status === 'expired' || (log.expiry_date && new Date(log.expiry_date) < new Date());
    };

    const isAvailable = (log: InventoryLog) => {
        return log.is_available && log.quantity_in_stock > 0 && !isExpired(log);
    };

    // Handlers for filters
    const handleStatusToggle = (status: string) => {
        setSelectedStatuses(prev => {
            const newSet = new Set(prev);
            if (newSet.has(status)) newSet.delete(status);
            else newSet.add(status);
            return newSet;
        });
    };

    const handleAvailabilityChange = (filter: AvailabilityFilter) => {
        setAvailabilityFilter(filter);
    };

    const handleCategoryToggle = (categoryId: number) => {
        setSelectedCategoryIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(categoryId)) newSet.delete(categoryId);
            else newSet.add(categoryId);
            return newSet;
        });
    };

    const handleSortChange = (field: SortField) => {
        if (sortBy === field) {
            setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setSelectedStatuses(new Set());
        setAvailabilityFilter('all');
        setSelectedCategoryIds(new Set());
        setSortBy('name');
        setSortOrder('asc');
        setPage(1);
    };

    // Selection handlers
    const handleCheckboxChange = (logId: number, checked: boolean) => {
        setSelectedItems(prev => {
            const newMap = new Map(prev);
            if (checked) {
                newMap.set(logId, 1);
            } else {
                newMap.delete(logId);
            }
            return newMap;
        });
    };

    const handleQuantityChange = (logId: number, quantity: number) => {
        if (quantity < 1) return;
        setSelectedItems(prev => {
            const newMap = new Map(prev);
            newMap.set(logId, quantity);
            return newMap;
        });
    };

    const handleAdd = () => {
        const items = Array.from(selectedItems.entries()).map(([inventoryId, quantity]) => ({
            inventoryId,
            quantity
        }));
        onSelect(items);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Select Inventory Items</h2>
                    <button onClick={onClose} className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Search Bar (always visible) */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <SearchHeader
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name, code, category, or status..."
                        showAdvanced={true}
                        onToggleAdvanced={() => {}} // No-op, filters always shown
                    />
                </div>

                {/* Main content: filter sidebar + table */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Filter Sidebar (always visible, fixed width) */}
                    <div className="w-80 border-r border-gray-200 dark:border-gray-700 p-4 overflow-y-auto space-y-6 bg-gray-50 dark:bg-gray-800/50">
                        {/* Status filter */}
                        <div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Status:</span>
                            <div className="flex flex-wrap gap-1">
                                {STATUS_OPTIONS.map(status => (
                                    <FilterButton
                                        key={status.value}
                                        isSelected={selectedStatuses.has(status.value)}
                                        onClick={() => handleStatusToggle(status.value)}
                                        className="text-xs px-2 py-1" // smaller button
                                    >
                                        {status.label}
                                    </FilterButton>
                                ))}
                            </div>
                        </div>

                        {/* Availability filter */}
                        <div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Availability:</span>
                            <div className="flex gap-1">
                                {(['all', 'available', 'unavailable'] as AvailabilityFilter[]).map(filter => (
                                    <FilterButton
                                        key={filter}
                                        isSelected={availabilityFilter === filter}
                                        onClick={() => handleAvailabilityChange(filter)}
                                        className="text-xs px-2 py-1"
                                    >
                                        {filter === 'all' ? 'All' : filter === 'available' ? 'Available' : 'Unavailable'}
                                    </FilterButton>
                                ))}
                            </div>
                        </div>

                        {/* Category filter */}
                        {categories.length > 0 && (
                            <div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Category:</span>
                                <div className="flex flex-wrap gap-1">
                                    {categories.map(cat => (
                                        <FilterButton
                                            key={cat.id}
                                            isSelected={selectedCategoryIds.has(cat.id)}
                                            onClick={() => handleCategoryToggle(cat.id)}
                                            className="text-xs px-2 py-1"
                                        >
                                            {selectedCategoryIds.has(cat.id) && <i className="fas fa-check text-xs mr-1" />}
                                            {cat.name}
                                        </FilterButton>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Sort controls */}
                        <div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Sort by:</span>
                            <div className="flex flex-wrap gap-1">
                                <FilterButton
                                    isSelected={sortBy === 'name'}
                                    onClick={() => handleSortChange('name')}
                                    className="text-xs px-2 py-1"
                                >
                                    Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </FilterButton>
                                <FilterButton
                                    isSelected={sortBy === 'quantity'}
                                    onClick={() => handleSortChange('quantity')}
                                    className="text-xs px-2 py-1"
                                >
                                    Stock {sortBy === 'quantity' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </FilterButton>
                                <FilterButton
                                    isSelected={sortBy === 'date_acquired'}
                                    onClick={() => handleSortChange('date_acquired')}
                                    className="text-xs px-2 py-1"
                                >
                                    Acquired {sortBy === 'date_acquired' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </FilterButton>
                                <FilterButton
                                    isSelected={sortBy === 'expiry_date'}
                                    onClick={() => handleSortChange('expiry_date')}
                                    className="text-xs px-2 py-1"
                                >
                                    Expiry {sortBy === 'expiry_date' && (sortOrder === 'asc' ? '↑' : '↓')}
                                </FilterButton>
                            </div>
                        </div>

                        {/* Reset button */}
                        <div className="pt-2">
                            <ResetButton onClick={handleResetFilters} />
                        </div>
                    </div>

                    {/* Table area (takes remaining space) */}
                    <div className="flex-1 overflow-y-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0 z-10 shadow-sm"> {/* Opaque header with shadow */}
                            <tr>
                                <th className="px-3 py-2 w-10"></th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Item</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Stock</th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Qty</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {paginatedLogs.map(log => {
                                const disabled = !isAvailable(log);
                                const selected = selectedItems.has(log.id);
                                return (
                                    <tr key={log.id} className={disabled ? 'opacity-50' : ''}>
                                        <td className="px-3 py-2">
                                            <input
                                                type="checkbox"
                                                checked={selected}
                                                onChange={(e) => handleCheckboxChange(log.id, e.target.checked)}
                                                disabled={disabled}
                                                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary disabled:opacity-50"
                                            />
                                        </td>
                                        <td className="px-3 py-2 text-gray-900 dark:text-gray-100">
                                            {log.menu_item?.name || 'Unknown'} ({log.menu_item?.code})
                                        </td>
                                        <td className="px-3 py-2 text-gray-600 dark:text-gray-400">
                                            {log.menu_item?.category?.name || '—'}
                                        </td>
                                        <td className="px-3 py-2">
                                            {isExpired(log) ? (
                                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Expired</span>
                                            ) : !log.is_available ? (
                                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">Unavailable</span>
                                            ) : log.quantity_in_stock === 0 ? (
                                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Out of Stock</span>
                                            ) : log.quantity_in_stock < 10 ? (
                                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">Low Stock</span>
                                            ) : (
                                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">In Stock</span>
                                            )}
                                        </td>
                                        <td className="px-3 py-2 text-right text-gray-900 dark:text-gray-100">
                                            ₱{Number(log.menu_item?.price || 0).toFixed(2)}
                                        </td>
                                        <td className="px-3 py-2 text-right text-gray-600 dark:text-gray-400">
                                            {log.quantity_in_stock}
                                        </td>
                                        <td className="px-3 py-2 text-right">
                                            <input
                                                type="number"
                                                min={1}
                                                max={log.quantity_in_stock}
                                                value={selected ? selectedItems.get(log.id) || 1 : 1}
                                                onChange={(e) => handleQuantityChange(log.id, parseInt(e.target.value) || 1)}
                                                disabled={!selected || disabled}
                                                className="w-16 px-2 py-1 text-right border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 disabled:opacity-50"
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="border-t border-gray-200 dark:border-gray-700 py-2 px-4"> {/* Reduced vertical padding */}
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                        />
                    </div>
                )}

                {/* Footer */}
                <div className="flex justify-end gap-4 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                    <CancelButton onClick={onClose} label="Cancel" />
                    <ActionButton
                        variant="blue"
                        onClick={handleAdd}
                        disabled={selectedItems.size === 0}
                        icon="plus"
                        count={selectedItems.size}
                    >
                        Add Selected
                    </ActionButton>
                </div>
            </div>
        </div>
    );
}