import {ActionButton} from "../../common/forms_action/ActionButton.tsx";


interface MenuActionFormProps {
    selectionMode: boolean;
    onToggleMode: () => void;
    onSelectAll: () => void;
    onDeleteSelected: () => void;
    selectedCount: number;
}

export function MenuActionForm({
                                   selectionMode,
                                   onToggleMode,
                                   onSelectAll,
                                   onDeleteSelected,
                                   selectedCount
                               }: MenuActionFormProps) {
    return (
        <div className="p-4 space-y-4">
            <div className="flex gap-4 items-center">
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

                {/* Delete Selected */}
                <ActionButton
                    variant="red"
                    disabled={!selectionMode || selectedCount === 0}
                    onClick={onDeleteSelected}
                    icon="trash"
                    count={selectedCount}
                >
                    Delete Selected
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