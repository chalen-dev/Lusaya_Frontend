import { useState } from 'react';
import type { Category } from "../menuTypes.ts";
import {FilterButton} from "../../common/forms_search_filter/FilterButton.tsx";
import {SearchHeader} from "../../common/forms_search_filter/SearchHeader.tsx";
import {ResetButton} from "../../common/forms_search_filter/ResetButton.tsx";

interface MenuSearchFormProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
    sortBy: 'id' | 'name' | 'price';
    sortOrder: 'asc' | 'desc';
    onSortChange: (by: 'name' | 'price', order: 'asc' | 'desc') => void;
    categories: Category[];
    selectedCategoryIds: Set<number>;
    onCategoryToggle: (categoryId: number) => void;
    onReset: () => void;
}

export function MenuSearchForm({
                                   searchTerm,
                                   onSearchChange,
                                   sortBy,
                                   sortOrder,
                                   onSortChange,
                                   categories,
                                   selectedCategoryIds,
                                   onCategoryToggle,
                                   onReset
                               }: MenuSearchFormProps) {
    const [showAdvanced, setShowAdvanced] = useState(false);

    return (
        <div className="p-4 space-y-4">
            <SearchHeader
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search by name, code, description or category..."
                showAdvanced={showAdvanced}
                onToggleAdvanced={() => setShowAdvanced(!showAdvanced)}
            />

            {showAdvanced && (
                <>
                    {/* Sort controls */}
                    <div className="flex gap-4 items-center">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</span>
                        <FilterButton
                            isSelected={sortBy === 'name'}
                            onClick={() => onSortChange('name', sortBy === 'name' && sortOrder === 'asc' ? 'desc' : 'asc')}
                        >
                            Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </FilterButton>
                        <FilterButton
                            isSelected={sortBy === 'price'}
                            onClick={() => onSortChange('price', sortBy === 'price' && sortOrder === 'asc' ? 'desc' : 'asc')}
                        >
                            Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </FilterButton>
                    </div>

                    {/* Category filters */}
                    {categories.length > 0 && (
                        <div>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                                Filter by category:
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {categories.map(cat => (
                                    <FilterButton
                                        key={cat.id}
                                        isSelected={selectedCategoryIds.has(cat.id)}
                                        onClick={() => onCategoryToggle(cat.id)}
                                    >
                                        {selectedCategoryIds.has(cat.id) && <i className="fas fa-check text-xs mr-1" />}
                                        {cat.name}
                                    </FilterButton>
                                ))}
                            </div>
                        </div>
                    )}

                    <ResetButton onClick={onReset} />
                </>
            )}
        </div>
    );
}