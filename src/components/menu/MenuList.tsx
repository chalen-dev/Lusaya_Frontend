import { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import axios from 'axios';
import { useHeaderTitle } from "../../contexts/HeaderTitleContext.tsx";
import { MenuItemCard } from "./partials/MenuItemCard.tsx";
import type { Category, EditingMenuItem, MenuItem } from "./menuTypes.ts";
import { FetchingDetails } from "../common/loading/FetchingDetails.tsx";
import { MenuForm } from "./forms/MenuForm.tsx";
import { MenuSearchForm } from "./forms/MenuSearchForm.tsx";
import { MenuActionForm } from "./forms/MenuActionForm.tsx";
import { showConfirmation, showToast } from '../../utils/swalHelpers';
import { Pagination } from "../common/Pagination.tsx";
import { MenuItemShowModal } from "./partials/MenuItemShowModal.tsx";
import { TabBar } from "../common/TabBar.tsx";
import { type Column, TableHeader } from "../common/TableHeader.tsx";

export function MenuList() {
    const { setTitle } = useHeaderTitle();
    const tabBarRef = useRef<HTMLDivElement>(null);
    const [headerTopOffset, setHeaderTopOffset] = useState(160);

    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'forms' | 'search' | 'select'>('forms');
    const [contentExpanded, setContentExpanded] = useState(false);
    const [editingItem, setEditingItem] = useState<EditingMenuItem | null>(null);

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'id' | 'name' | 'price'>('id');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<number>>(new Set());
    const [categories, setCategories] = useState<Category[]>([]);

    // Selection mode states
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    // View mode states
    const [viewingItemId, setViewingItemId] = useState<number | null>(null);

    // Pagination (client-side)
    const [page, setPage] = useState(1);
    const perPage = 25;

    useEffect(() => {
        setTitle('Menu List');
    }, [setTitle]);

    useEffect(() => {
        void fetchMenuItems();
        void fetchCategories();
    }, []);

    // Use ResizeObserver to keep header positioned exactly below the tab bar
    useEffect(() => {
        if (!tabBarRef.current) return;

        const observer = new ResizeObserver(entries => {
            for (const entry of entries) {
                const height = entry.contentRect.height;
                setHeaderTopOffset(50 + height);
            }
        });

        observer.observe(tabBarRef.current);

        return () => observer.disconnect();
    }, []);

    const fetchMenuItems = async () => {
        try {
            setLoading(true);
            const response = await api.get<MenuItem[]>('/menu-items');
            setMenuItems(response.data);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || err.message || 'Failed to fetch menu items');
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get<Category[]>('/categories');
            setCategories(response.data);
        } catch (err) {
            console.error('Failed to fetch categories', err);
        }
    };

    // Filtering and sorting (client-side)
    const filteredMenuItems = menuItems
        .filter(item => {
            const term = searchTerm.toLowerCase();
            const matchesSearch =
                item.name.toLowerCase().includes(term) ||
                item.code.toLowerCase().includes(term) ||
                (item.description?.toLowerCase() || '').includes(term) ||
                (item.category?.name?.toLowerCase() || '').includes(term);

            const matchesCategory =
                selectedCategoryIds.size === 0 ||
                (item.category?.id && selectedCategoryIds.has(item.category.id));

            return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
            if (sortBy === 'id') {
                return sortOrder === 'asc' ? a.id - b.id : b.id - a.id;
            } else if (sortBy === 'name') {
                const compare = a.name.localeCompare(b.name);
                return sortOrder === 'asc' ? compare : -compare;
            } else { // price
                const priceA = typeof a.price === 'string' ? parseFloat(a.price) : a.price;
                const priceB = typeof b.price === 'string' ? parseFloat(b.price) : b.price;
                return sortOrder === 'asc' ? priceA - priceB : priceB - priceA;
            }
        });

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [searchTerm, selectedCategoryIds, sortBy, sortOrder]);

    // Paginated items
    const totalPages = Math.ceil(filteredMenuItems.length / perPage);
    const paginatedItems = filteredMenuItems.slice((page - 1) * perPage, page * perPage);

    const handleEdit = (item: MenuItem) => {
        setEditingItem({
            id: item.id,
            name: item.name,
            price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
            code: item.code,
            category_id: item.category?.id ?? 0,
            description: item.description,
            image_url: item.image_url,
        });
        setActiveTab('forms');
        setContentExpanded(true);
    };

    const handleCancelEdit = () => {
        setEditingItem(null);
    };

    const handleViewItem = (id: number) => {
        setViewingItemId(id);
    };

    const handleItemAdded = (action: 'add' | 'update') => {
        fetchMenuItems().then(() => {
            if (action === 'add') {
                showToast('Item added successfully', 'success');
            } else {
                showToast('Item updated successfully', 'success');
            }
        });
        setEditingItem(null);
    };

    const handleDelete = async (id: number) => {
        const confirmed = await showConfirmation(
            'Confirm Delete',
            'Are you sure you want to delete this item?',
            'warning',
            'Yes, delete'
        );
        if (!confirmed) return;

        try {
            await api.delete(`/menu-items/${id}`);
            setMenuItems(prev => prev.filter(item => item.id !== id));
            showToast('Item deleted successfully', 'success');
        } catch (err) {
            let message = 'Delete failed';
            if (axios.isAxiosError(err)) {
                message = err.response?.data?.message || err.message;
            } else if (err instanceof Error) {
                message = err.message;
            }
            alert(message);
        }
    };

    const handleCategoryToggle = (categoryId: number) => {
        setSelectedCategoryIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(categoryId)) {
                newSet.delete(categoryId);
            } else {
                newSet.add(categoryId);
            }
            return newSet;
        });
    };

    const handleSortChange = (by: 'name' | 'price', order: 'asc' | 'desc') => {
        setSortBy(by);
        setSortOrder(order);
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setSortBy('id');
        setSortOrder('asc');
        setSelectedCategoryIds(new Set());
    };

    // Selection handlers
    const toggleSelectionMode = () => {
        if (selectionMode) {
            setSelectedIds(new Set());
        }
        setSelectionMode(!selectionMode);
    };

    const handleSelectAll = () => {
        const allIds = new Set(paginatedItems.map(item => item.id));
        setSelectedIds(allIds);
    };

    const handleToggleItemSelection = (id: number) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
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

        try {
            await api.post('/menu-items/bulk-delete', { ids: Array.from(selectedIds) });
            await fetchMenuItems();
            setSelectedIds(new Set());
            setSelectionMode(false);
            showToast(`${selectedIds.size} item(s) deleted successfully`, 'success');
        } catch (err) {
            let message = 'Bulk delete failed';
            if (axios.isAxiosError(err)) {
                message = err.response?.data?.message || err.message;
            } else if (err instanceof Error) {
                message = err.message;
            }
            alert(message);
        }
    };

    const goToPage = (newPage: number) => {
        setPage(newPage);
    };

    if (loading && menuItems.length === 0) {
        return <FetchingDetails />;
    }
    if (error) return <div>Error: {error}</div>;

    const menuColumns: Column[] = [
        { key: 'id', label: 'ID', width: selectionMode ? 'w-20' : 'w-16' },
        { key: 'name', label: 'Item Name', width: 'flex-1' },
        { key: 'category', label: 'Category', width: 'w-32' },
        { key: 'price', label: 'Price', width: 'w-24', align: 'right' },
        { key: 'actions', label: 'Actions', width: 'w-32', align: 'right' },
    ];

    return (
        <div className="menu-list-container">
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
                    isEditing={!!editingItem}
                    formsLabel={editingItem ? 'Edit Item' : 'Add Item'}
                    searchLabel="Search and Filter"
                    selectLabel="Actions"
                    onFormsTabSelected={() => {
                        setEditingItem(null);
                        setSearchTerm('');
                        setSelectedCategoryIds(new Set());
                        setSortBy('id');
                        setSortOrder('asc');
                    }}
                />

                {contentExpanded && (
                    <>
                        {activeTab === 'forms' && (
                            <MenuForm
                                onItemAdded={handleItemAdded}
                                onCancel={handleCancelEdit}
                                noCard={true}
                                editingItem={editingItem}
                            />
                        )}
                        {activeTab === 'search' && (
                            <MenuSearchForm
                                searchTerm={searchTerm}
                                onSearchChange={setSearchTerm}
                                sortBy={sortBy}
                                sortOrder={sortOrder}
                                onSortChange={handleSortChange}
                                categories={categories}
                                selectedCategoryIds={selectedCategoryIds}
                                onCategoryToggle={handleCategoryToggle}
                                onReset={handleResetFilters}
                            />
                        )}
                        {activeTab === 'select' && (
                            <MenuActionForm
                                selectionMode={selectionMode}
                                onToggleMode={toggleSelectionMode}
                                onSelectAll={handleSelectAll}
                                onDeleteSelected={handleDeleteSelected}
                                selectedCount={selectedIds.size}
                            />
                        )}
                    </>
                )}
            </div>

            {/* Table Header */}
            {menuItems.length > 0 && (
                <TableHeader
                    columns={menuColumns}
                    selectionMode={selectionMode}
                    className="sticky z-10"
                    style={{ top: `${headerTopOffset}px` }}
                />
            )}

            {/* Menu items grid */}
            <div className="cards-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.1rem' }}>
                {paginatedItems.map(item => (
                    <MenuItemCard
                        key={item.id}
                        item={item}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                        onView={handleViewItem}
                        selectionMode={selectionMode}
                        isSelected={selectedIds.has(item.id)}
                        onToggleSelection={handleToggleItemSelection}
                    />
                ))}
                {paginatedItems.length === 0 && !loading && (
                    <div className="w-full text-center py-8 text-gray-500 dark:text-gray-400">
                        No items match your search/filters.
                    </div>
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={goToPage}
                    disabled={loading}
                />
            )}

            {/* View Modal */}
            {viewingItemId && (
                <MenuItemShowModal
                    itemId={viewingItemId}
                    onClose={() => setViewingItemId(null)}
                />
            )}
        </div>
    );
}