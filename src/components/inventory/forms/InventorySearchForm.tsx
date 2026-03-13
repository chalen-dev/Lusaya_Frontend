// InventorySearchForm.tsx
import { useState } from 'react';

// Status options (should match backend enum)
const STATUS_OPTIONS = [
    { value: 'in_stock', label: 'In Stock' },
    { value: 'low_stock', label: 'Low Stock' },
    { value: 'out_of_stock', label: 'Out of Stock' },
    { value: 'expired', label: 'Expired' },
];

type SortField = 'name' | 'quantity' | 'date_acquired' | 'expiry_date';
type SortOrder = 'asc' | 'desc';
type AvailabilityFilter = 'all' | 'available' | 'unavailable';

interface InventorySearchFormProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
    selectedStatuses: Set<string>;
    onStatusToggle: (status: string) => void;
    availabilityFilter: AvailabilityFilter;
    onAvailabilityChange: (filter: AvailabilityFilter) => void;
    sortBy: SortField;
    sortOrder: SortOrder;
    onSortChange: (by: SortField, order: SortOrder) => void;
    onReset: () => void;
}

export function InventorySearchForm({
                                        searchTerm,
                                        onSearchChange,
                                        selectedStatuses,
                                        onStatusToggle,
                                        availabilityFilter,
                                        onAvailabilityChange,
                                        sortBy,
                                        sortOrder,
                                        onSortChange,
                                        onReset,
                                    }: InventorySearchFormProps) {
    const [showAdvanced, setShowAdvanced] = useState(false);

    const handleSort = (field: SortField) => {
        const newOrder = sortBy === field && sortOrder === 'asc' ? 'desc' : 'asc';
        onSortChange(field, newOrder);
    };

    return (
        <div className="p-4 space-y-4">
            {/* Search row with toggle button */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search by menu item name or code..."
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    autoFocus
                />
                <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    title={showAdvanced ? 'Hide advanced filters' : 'Show advanced filters'}
                >
                    <i className={`fas fa-${showAdvanced ? 'chevron-up' : 'sliders-h'}`} />
                </button>
            </div>

            {/* Advanced filters (conditionally rendered) */}
            {showAdvanced && (
                <>
                    {/* Status filter */}
                    <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                            Filter by status:
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {STATUS_OPTIONS.map(status => {
                                const isSelected = selectedStatuses.has(status.value);
                                return (
                                    <button
                                        key={status.value}
                                        onClick={() => onStatusToggle(status.value)}
                                        className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                                            isSelected
                                                ? 'bg-primary text-white'
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                        }`}
                                    >
                                        {status.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Availability filter */}
                    <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                            Availability:
                        </span>
                        <div className="flex gap-2">
                            {(['all', 'available', 'unavailable'] as AvailabilityFilter[]).map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => onAvailabilityChange(filter)}
                                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                                        availabilityFilter === filter
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    {filter === 'all' ? 'All' : filter === 'available' ? 'Available' : 'Unavailable'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sort controls */}
                    <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                            Sort by:
                        </span>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => handleSort('name')}
                                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                                    sortBy === 'name'
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </button>
                            <button
                                onClick={() => handleSort('quantity')}
                                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                                    sortBy === 'quantity'
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                Quantity {sortBy === 'quantity' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </button>
                            <button
                                onClick={() => handleSort('date_acquired')}
                                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                                    sortBy === 'date_acquired'
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                Date Acquired {sortBy === 'date_acquired' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </button>
                            <button
                                onClick={() => handleSort('expiry_date')}
                                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                                    sortBy === 'expiry_date'
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                            >
                                Expiry Date {sortBy === 'expiry_date' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </button>
                        </div>
                    </div>

                    {/* Reset button */}
                    <div className="flex justify-end">
                        <button
                            onClick={onReset}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                        >
                            <i className="fas fa-undo" />
                            Reset Filters
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}