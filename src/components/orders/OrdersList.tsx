// pages/orders/OrdersList.tsx
import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import axios from 'axios';
import { useHeaderTitle } from '../../contexts/HeaderTitleContext';
import { FetchingDetails } from '../common/loading/FetchingDetails';
import { Pagination } from '../common/Pagination';
import { TabBar } from '../common/TabBar';
import { showToast, showConfirmation } from '../../utils/swalHelpers';
import { OrderCard } from './partials/OrderCard';
import { OrderForm } from './forms/OrderForm';
import type { Order, User } from './orderTypes';
import type { InventoryLog } from '../inventory/inventoryTypes';

export function OrdersList() {
    const { setTitle } = useHeaderTitle();
    const queryClient = useQueryClient();
    const tabBarRef = useRef<HTMLDivElement>(null);

    // Fetch orders
    const {
        data: orders = [],
        isLoading,
        error: queryError
    } = useQuery({
        queryKey: ['orders'],
        queryFn: async () => {
            const response = await api.get<Order[]>('/orders');
            return response.data;
        },
    });

    // Fetch inventory logs (for item selection)
    const {
        data: inventoryLogs = [],
        isLoading: inventoryLogsLoading
    } = useQuery({
        queryKey: ['inventory-logs'],
        queryFn: async () => {
            const response = await api.get<InventoryLog[]>('/inventory-logs');
            return response.data;
        },
    });

    // Fetch users (for customer selection)
    const {
        data: users = [],
        isLoading: usersLoading
    } = useQuery({
        queryKey: ['users'],
        queryFn: async () => {
            const response = await api.get<User[]>('/users');
            return response.data;
        },
    });

    // UI state for sticky top bar
    const [activeTab, setActiveTab] = useState<'forms' | 'search' | 'select'>('forms');
    const [contentExpanded, setContentExpanded] = useState(false);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);

    // Selection mode states (for future)
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    // Pagination (client-side)
    const [page, setPage] = useState(1);
    const perPage = 10;

    // Sticky header offset
    const [headerTopOffset, setHeaderTopOffset] = useState(160);

    useEffect(() => {
        setTitle('Orders');
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

    // Paginated items
    const totalPages = Math.ceil(orders.length / perPage);
    const paginatedOrders = orders.slice((page - 1) * perPage, page * perPage);

    // Mutations
    const deleteMutation = useMutation({
        mutationFn: (id: number) => api.delete(`/orders/${id}`),
        onSuccess: (_data, id) => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            showToast(`Order #${id} deleted successfully`, 'success');
        },
        onError: (error) => {
            const message = axios.isAxiosError(error)
                ? error.response?.data?.message || error.message
                : 'Delete failed';
            showToast(message, 'error');
        },
    });

    // Bulk delete mutation (placeholder – not implemented in backend yet)
    const bulkDeleteMutation = useMutation({
        mutationFn: (ids: number[]) => api.post('/orders/bulk-delete', { ids }),
        onSuccess: (_data, ids) => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            setSelectedIds(new Set());
            setSelectionMode(false);
            showToast(`${ids.length} order(s) deleted successfully`, 'success');
        },
        onError: (error) => {
            const message = axios.isAxiosError(error)
                ? error.response?.data?.message || error.message
                : 'Bulk delete failed';
            showToast(message, 'error');
        },
    });

    // Handlers
    const handleEdit = (order: Order) => {
        setEditingOrder(order);
        setActiveTab('forms');
        setContentExpanded(true);
    };

    const handleCancelEdit = () => setEditingOrder(null);

    const handleView = (id: number) => {
        console.log('View order', id);
    };

    const handleOrderAdded = (action: 'add' | 'update') => {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        showToast(action === 'add' ? 'Order created successfully' : 'Order updated successfully', 'success');
        setEditingOrder(null);
    };

    const handleDelete = async (id: number) => {
        const confirmed = await showConfirmation(
            'Confirm Delete',
            'Are you sure you want to delete this order?',
            'warning',
            'Yes, delete'
        );
        if (!confirmed) return;
        deleteMutation.mutate(id);
    };

    // Selection handlers (for future)
    const toggleSelectionMode = () => {
        if (selectionMode) setSelectedIds(new Set());
        setSelectionMode(!selectionMode);
    };

    const handleSelectAll = () => setSelectedIds(new Set(paginatedOrders.map(order => order.id)));

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
            `Are you sure you want to delete ${selectedIds.size} order(s)?`,
            'warning',
            'Yes, delete'
        );
        if (!confirmed) return;
        bulkDeleteMutation.mutate(Array.from(selectedIds));
    };

    const goToPage = (newPage: number) => setPage(newPage);

    if (isLoading) return <FetchingDetails />;
    if (queryError) return <div className="p-4 text-red-600 dark:text-red-400">Error: {(queryError as Error).message}</div>;

    return (
        <div className="orders-list-container">
            {/* Sticky top bar with tabs */}
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
                    isEditing={!!editingOrder}
                    formsLabel={editingOrder ? 'Edit Order' : 'Create Order'}
                    searchLabel="Search and Filter"
                    selectLabel="Actions"
                    onFormsTabSelected={() => setEditingOrder(null)}
                />

                {contentExpanded && (
                    <>
                        {activeTab === 'forms' && (
                            <OrderForm
                                onOrderAdded={handleOrderAdded}
                                onCancel={handleCancelEdit}
                                noCard={true}
                                editingOrder={editingOrder}
                                inventoryLogs={inventoryLogs}
                                users={users}
                            />
                        )}
                        {activeTab === 'search' && (
                            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                Search and filter coming soon...
                            </div>
                        )}
                        {activeTab === 'select' && (
                            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                Bulk actions coming soon...
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Orders grid */}
            <div className="cards-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.1rem' }}>
                {paginatedOrders.map(order => (
                    <OrderCard
                        key={order.id}
                        order={order}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                        onView={handleView}
                        selectionMode={selectionMode}
                        isSelected={selectedIds.has(order.id)}
                        onToggleSelection={handleToggleItemSelection}
                    />
                ))}
                {orders.length === 0 && (
                    <div className="w-full text-center py-8 text-gray-500 dark:text-gray-400">
                        No orders found.
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
        </div>
    );
}