// components/common/TabBar.tsx

export type TabType = 'forms' | 'search' | 'select';

interface TabBarProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
    contentExpanded: boolean;
    onToggleExpand: () => void;
    isEditing?: boolean; // true if editing an item (shows pen icon instead of plus)
    formsLabel?: string;
    searchLabel?: string;
    selectLabel?: string;
    onFormsTabSelected?: () => void; // extra callback when forms tab is clicked (e.g., reset filters)
}

export function TabBar({
                           activeTab,
                           onTabChange,
                           contentExpanded,
                           onToggleExpand,
                           isEditing = false,
                           formsLabel = 'Add',
                           searchLabel = 'Search',
                           selectLabel = 'Actions',
                           onFormsTabSelected,
                       }: TabBarProps) {
    const handleFormsClick = () => {
        if (activeTab === 'forms') {
            onToggleExpand();
        } else {
            onTabChange('forms');
            if (onFormsTabSelected) {
                onFormsTabSelected();
            }
        }
    };

    const handleSearchClick = () => {
        if (activeTab === 'search') {
            onToggleExpand();
        } else {
            onTabChange('search');
        }
    };

    const handleSelectClick = () => {
        if (activeTab === 'select') {
            onToggleExpand();
        } else {
            onTabChange('select');
        }
    };

    return (
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
            <div className="flex gap-2">
                {/* Forms Tab */}
                <button
                    onClick={handleFormsClick}
                    className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
                        activeTab === 'forms'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                >
                    <i className={`fas fa-${isEditing ? 'pen' : 'plus-circle'} mr-2`} />
                    {formsLabel}
                </button>

                {/* Search Tab */}
                <button
                    onClick={handleSearchClick}
                    className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
                        activeTab === 'search'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                >
                    <i className="fas fa-search mr-2" />
                    {searchLabel}
                </button>

                {/* Select/Actions Tab */}
                <button
                    onClick={handleSelectClick}
                    className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
                        activeTab === 'select'
                            ? 'text-primary border-b-2 border-primary'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                    }`}
                >
                    <i className="fas fa-tasks mr-2" />
                    {selectLabel}
                </button>
            </div>

            {/* Expand/Collapse Button */}
            <button
                type="button"
                onClick={onToggleExpand}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                aria-label={contentExpanded ? 'Hide forms' : 'Show forms'}
            >
                <i className={`fas fa-${contentExpanded ? 'eye-slash' : 'eye'} mr-1`} />
                {contentExpanded ? 'Hide' : 'Show'}
            </button>
        </div>
    );
}