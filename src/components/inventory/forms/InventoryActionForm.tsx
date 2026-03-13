// InventorySelectForm.tsx
interface InventoryActionFormProps {
    selectionMode: boolean;
    onToggleMode: () => void;
    onSelectAll: () => void;
    onDeleteSelected: () => void;
    onMarkAvailable: () => void;
    onMarkUnavailable: () => void;
    selectedCount: number;
}

export function InventoryActionForm({
                                        selectionMode,
                                        onToggleMode,
                                        onSelectAll,
                                        onDeleteSelected,
                                        onMarkAvailable,
                                        onMarkUnavailable,
                                        selectedCount
                                    }: InventoryActionFormProps) {
    return (
        <div className="p-4 space-y-4">
            <div className="flex flex-wrap gap-4 items-center">
                {/* Select Mode Toggle */}
                <button
                    onClick={onToggleMode}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        selectionMode
                            ? 'bg-purple-600 text-white hover:bg-purple-700'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                    <i className={`fas fa-${selectionMode ? 'check-square' : 'square'} mr-2`} />
                    {selectionMode ? 'Exit Select Mode' : 'Select Mode'}
                </button>

                {/* Select All */}
                <button
                    onClick={onSelectAll}
                    disabled={!selectionMode}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        selectionMode
                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                            : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    }`}
                >
                    <i className="fas fa-check-double mr-2" />
                    Select All
                </button>

                {/* Mark Available */}
                <button
                    onClick={onMarkAvailable}
                    disabled={!selectionMode || selectedCount === 0}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        selectionMode && selectedCount > 0
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    }`}
                >
                    <i className="fas fa-check-circle mr-2" />
                    Mark Available {selectedCount > 0 ? `(${selectedCount})` : ''}
                </button>

                {/* Mark Unavailable */}
                <button
                    onClick={onMarkUnavailable}
                    disabled={!selectionMode || selectedCount === 0}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        selectionMode && selectedCount > 0
                            ? 'bg-orange-500 text-white hover:bg-orange-600'
                            : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    }`}
                >
                    <i className="fas fa-times-circle mr-2" />
                    Mark Unavailable {selectedCount > 0 ? `(${selectedCount})` : ''}
                </button>

                {/* Delete Selected */}
                <button
                    onClick={onDeleteSelected}
                    disabled={!selectionMode || selectedCount === 0}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                        selectionMode && selectedCount > 0
                            ? 'bg-red-500 text-white hover:bg-red-600'
                            : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    }`}
                >
                    <i className="fas fa-trash mr-2" />
                    Delete Selected {selectedCount > 0 ? `(${selectedCount})` : ''}
                </button>
            </div>

            {selectionMode && selectedCount > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedCount} item(s) selected
                </p>
            )}
        </div>
    );
}