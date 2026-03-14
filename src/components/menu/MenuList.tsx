import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
    const queryClient = useQueryClient();

    const {
        data: menuItems = [],
        isLoading,
        error: queryError
    } = useQuery({
        queryKey: ['menu-items'],
        queryFn: async () => {
            const response = await api.get<MenuItem[]>('/menu-items');
            return response.data;
        },
    });

    const {
        data: categories = []
    } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await api.get<Category[]>('/categories');
            return response.data;
        },
    });

    const tabBarRef = useRef<HTMLDivElement>(null);
    const [headerTopOffset, setHeaderTopOffset] = useState(160);
    const [activeTab, setActiveTab] = useState<'forms' | 'search' | 'select'>('forms');
    const [contentExpanded, setContentExpanded] = useState(false);
    const [editingItem, setEditingItem] = useState<EditingMenuItem | null>(null);

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'id' | 'name' | 'price'>('id');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<number>>(new Set());

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

    // ResizeObserver for sticky header
    useEffect(() => {
        if (!tabBarRef.current) return;
        const observer = new ResizeObserver(entries => {
            for (const entry of entries) {
                setHeaderTopOffset(50 + entry.contentRect.height);
            }
        });
        observer.observe(tabBarRef.current);
        return () => observer.disconnect();
    }, []);

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
            } else {
                const priceA = typeof a.price === 'string' ? parseFloat(a.price) : a.price;
                const priceB = typeof b.price === 'string' ? parseFloat(b.price) : b.price;
                return sortOrder === 'asc' ? priceA - priceB : priceB - priceA;
            }
        });

    // Reset page when filters change
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPage(1);
    }, [searchTerm, selectedCategoryIds, sortBy, sortOrder]);

    const totalPages = Math.ceil(filteredMenuItems.length / perPage);
    const paginatedItems = filteredMenuItems.slice((page - 1) * perPage, page * perPage);

    // Mutations
    const deleteMutation = useMutation({
        mutationFn: (id: number) => api.delete(`/menu-items/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['menu-items'] });
            showToast('Item deleted successfully', 'success');
        },
        onError: (error) => {
            const message = axios.isAxiosError(error)
                ? error.response?.data?.message || error.message
                : 'Delete failed';
            showToast(message, 'error');
        },
    });

    const bulkDeleteMutation = useMutation({
        mutationFn: (ids: number[]) => api.post('/menu-items/bulk-delete', { ids }),
        onSuccess: (_, ids) => {
            queryClient.invalidateQueries({ queryKey: ['menu-items'] });
            setSelectedIds(new Set());
            setSelectionMode(false);
            showToast(`${ids.length} item(s) deleted successfully`, 'success');
        },
        onError: (error) => {
            const message = axios.isAxiosError(error)
                ? error.response?.data?.message || error.message
                : 'Bulk delete failed';
            showToast(message, 'error');
        },
    });

    // Handlers
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

    const handleCancelEdit = () => setEditingItem(null);

    const handleViewItem = (id: number) => setViewingItemId(id);

    const handleItemAdded = (action: 'add' | 'update') => {
        queryClient.invalidateQueries({ queryKey: ['menu-items'] });
        showToast(action === 'add' ? 'Item added successfully' : 'Item updated successfully', 'success');
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
        deleteMutation.mutate(id);
    };

    const handleCategoryToggle = (categoryId: number) => {
        setSelectedCategoryIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(categoryId)) newSet.delete(categoryId);
            else newSet.add(categoryId);
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
        if (selectionMode) setSelectedIds(new Set());
        setSelectionMode(!selectionMode);
    };

    const handleSelectAll = () => setSelectedIds(new Set(paginatedItems.map(item => item.id)));

    const handleToggleItemSelection = (id: number) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
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
        bulkDeleteMutation.mutate(Array.from(selectedIds));
    };

    const goToPage = (newPage: number) => setPage(newPage);

    if (isLoading) return <FetchingDetails />;
    if (queryError) return <div>Error: {(queryError as Error).message}</div>;

    const menuColumns: Column[] = [
        { key: 'id', label: 'ID', width: selectionMode ? 'w-20' : 'w-16' },
        { key: 'name', label: 'Item Name', width: 'flex-1' },
        { key: 'code', label: 'Code', width: 'w-20' },
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
                {paginatedItems.length === 0 && !isLoading && (
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
                    disabled={isLoading}
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