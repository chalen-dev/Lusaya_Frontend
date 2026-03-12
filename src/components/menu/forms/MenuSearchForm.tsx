import type { Category } from "../menuTypes.ts";

interface MenuSearchFormProps {
    searchTerm: string;
    onSearchChange: (term: string) => void;
    sortBy: 'id' | 'name' | 'price';   // now includes 'id'
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
    return (
        <div className="p-4 space-y-4">
            {/* Search input */}
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search by name, code, description or category..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                autoFocus
            />

            {/* Sort controls */}
            <div className="flex gap-4 items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</span>
                <button
                    onClick={() => onSortChange('name', sortBy === 'name' && sortOrder === 'asc' ? 'desc' : 'asc')}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        sortBy === 'name'
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                    Name {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
                <button
                    onClick={() => onSortChange('price', sortBy === 'price' && sortOrder === 'asc' ? 'desc' : 'asc')}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                        sortBy === 'price'
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                    Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                </button>
            </div>

            {/* Category filters as buttons */}
            {categories.length > 0 && (
                <div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">Filter by category:</span>
                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => {
                            const isSelected = selectedCategoryIds.has(cat.id);
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => onCategoryToggle(cat.id)}
                                    className={`flex items-center gap-1 px-3 py-1 text-sm rounded-lg transition-colors ${
                                        isSelected
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    {isSelected && <i className="fas fa-check text-xs" />}
                                    {cat.name}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

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
        </div>
    );
}