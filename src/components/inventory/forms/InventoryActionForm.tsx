import {ActionButton} from "../../common/forms_action/ActionButton.tsx";


interface InventoryActionFormProps {
    selectionMode: boolean;
    onToggleMode: () => void;
    onSelectAll: () => void;
    onDeleteSelected: () => void;
    onArchiveSelected: () => void;
    onUnarchiveSelected: () => void;
    onMarkAvailable: () => void;
    onMarkUnavailable: () => void;
    selectedCount: number;
}

export function InventoryActionForm({
                                        selectionMode,
                                        onToggleMode,
                                        onSelectAll,
                                        onDeleteSelected,
                                        onArchiveSelected,
                                        onUnarchiveSelected,
                                        onMarkAvailable,
                                        onMarkUnavailable,
                                        selectedCount
                                    }: InventoryActionFormProps) {
    return (
        <div className="p-4 space-y-4">
            <div className="flex flex-wrap gap-4 items-center">
                {/* Select Mode Toggle */}
                <ActionButton
                    variant={selectionMode ? 'purple' : 'gray'}
                    onClick={onToggleMode}
                    icon={selectionMode ? 'check-square' : 'square'}
                >
                    {selectionMode ? 'Exit Select Mode' : 'Select Mode'}
                </ActionButton>

                {/* Select All */}
                <ActionButton
                    variant="blue"
                    disabled={!selectionMode}
                    onClick={onSelectAll}
                    icon="check-double"
                >
                    Select All
                </ActionButton>

                {/* Archive Selected */}
                <ActionButton
                    variant="yellow"
                    disabled={!selectionMode || selectedCount === 0}
                    onClick={onArchiveSelected}
                    icon="archive"
                    count={selectedCount}
                >
                    Archive
                </ActionButton>

                {/* Unarchive Selected */}
                <ActionButton
                    variant="teal"
                    disabled={!selectionMode || selectedCount === 0}
                    onClick={onUnarchiveSelected}
                    icon="box-open"
                    count={selectedCount}
                >
                    Unarchive
                </ActionButton>

                {/* Mark Available */}
                <ActionButton
                    variant="green"
                    disabled={!selectionMode || selectedCount === 0}
                    onClick={onMarkAvailable}
                    icon="check-circle"
                    count={selectedCount}
                >
                    Available
                </ActionButton>

                {/* Mark Unavailable */}
                <ActionButton
                    variant="orange"
                    disabled={!selectionMode || selectedCount === 0}
                    onClick={onMarkUnavailable}
                    icon="times-circle"
                    count={selectedCount}
                >
                    Unavailable
                </ActionButton>

                {/* Delete Selected */}
                <ActionButton
                    variant="red"
                    disabled={!selectionMode || selectedCount === 0}
                    onClick={onDeleteSelected}
                    icon="trash"
                    count={selectedCount}
                >
                    Delete
                </ActionButton>
            </div>

            {selectionMode && selectedCount > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedCount} item(s) selected
                </p>
            )}
        </div>
    );
}