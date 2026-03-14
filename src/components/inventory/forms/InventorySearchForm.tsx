import { useState } from 'react';
import {
    type SortField,
    type SortOrder,
    type AvailabilityFilter,
    type ArchiveFilter,
    STATUS_OPTIONS,
} from '../inventoryTypes';
import {SearchHeader} from "../../common/forms_search_filter/SearchHeader.tsx";
import {FilterButton} from "../../common/forms_search_filter/FilterButton.tsx";
import {ResetButton} from "../../common/forms_search_filter/ResetButton.tsx";

interface InventorySearchFormProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
    selectedStatuses: Set<string>;
    onStatusToggle: (status: string) => void;
    availabilityFilter: AvailabilityFilter;
    onAvailabilityChange: (filter: AvailabilityFilter) => void;
    archiveFilter: ArchiveFilter;
    onArchiveChange: (filter: ArchiveFilter) => void;
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
                                        archiveFilter,
                                        onArchiveChange,
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
            <SearchHeader
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search by menu item name or code..."
                showAdvanced={showAdvanced}
                onToggleAdvanced={() => setShowAdvanced(!showAdvanced)}
            />

            {showAdvanced && (
                <>
                    {/* Status filter */}
                    <div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                Filter by status:
            </span>
                        <div className="flex flex-wrap gap-2">
                            {STATUS_OPTIONS.map(status => (
                                <FilterButton
                                    key={status.value}
                                    isSelected={selectedStatuses.has(status.value)}
                                    onClick={() => onStatusToggle(status.value)}
                                >
                                    {status.label}
                                </FilterButton>
                            ))}
                        </div>
                    </div>

                    {/* Availability filter */}
                    <div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                Availability:
            </span>
                        <div className="flex gap-2">
                            {(['all', 'available', 'unavailable'] as AvailabilityFilter[]).map(filter => (
                                <FilterButton
                                    key={filter}
                                    isSelected={availabilityFilter === filter}
                                    onClick={() => onAvailabilityChange(filter)}
                                >
                                    {filter === 'all' ? 'All' : filter === 'available' ? 'Available' : 'Unavailable'}
                                </FilterButton>
                            ))}
                        </div>
                    </div>

                    {/* Archive filter */}
                    <div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                Archive status:
            </span>
                        <div className="flex gap-2">
                            {(['unarchived', 'archived', 'all'] as ArchiveFilter[]).map(filter => (
                                <FilterButton
                                    key={filter}
                                    isSelected={archiveFilter === filter}
                                    onClick={() => onArchiveChange(filter)}
                                >
                                    {filter === 'unarchived' ? 'Unarchived' : filter === 'archived' ? 'Archived' : 'All'}
                                </FilterButton>
                            ))}
                        </div>
                    </div>

                    {/* Sort controls */}
                    <div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                Sort by:
            </span>
                        <div className="flex flex-wrap gap-2">
                            <FilterButton
                                isSelected={sortBy === 'name'}
                                onClick={() => handleSort('name')}
                            >
                                Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </FilterButton>
                            <FilterButton
                                isSelected={sortBy === 'quantity'}
                                onClick={() => handleSort('quantity')}
                            >
                                Quantity {sortBy === 'quantity' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </FilterButton>
                            <FilterButton
                                isSelected={sortBy === 'date_acquired'}
                                onClick={() => handleSort('date_acquired')}
                            >
                                Date Acquired {sortBy === 'date_acquired' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </FilterButton>
                            <FilterButton
                                isSelected={sortBy === 'expiry_date'}
                                onClick={() => handleSort('expiry_date')}
                            >
                                Expiry Date {sortBy === 'expiry_date' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </FilterButton>
                        </div>
                    </div>

                    <ResetButton onClick={onReset} />
                </>
            )}
        </div>
    );
}