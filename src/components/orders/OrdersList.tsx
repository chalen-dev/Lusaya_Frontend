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
import { OrderForm } from './forms/OrderForm';
import { OrderSearchForm } from './forms/OrderSearchForm';
import type { Order, User, OrderStatus } from './orderTypes';
import type { InventoryLog } from '../inventory/inventoryTypes';
import { OrderActionForm } from "./forms/OrderActionForm";
import { OrderCard } from "./partials/order_card/OrderCard";

export function OrdersList() {
    const { setTitle } = useHeaderTitle();
    const queryClient = useQueryClient();
    const tabBarRef = useRef<HTMLDivElement>(null);

    // Fetch current user to determine role
    const { data: currentUser } = useQuery({
        queryKey: ['currentUser'],
        queryFn: async () => {
            const response = await api.get('/user');
            return response.data as User;
        },
    });

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
    } = useQuery({
        queryKey: ['inventory-logs'],
        queryFn: async () => {
            const response = await api.get<InventoryLog[]>('/inventory-logs');
            return response.data;
        },
    });

    // Fetch customers (for customer selection)
    const {
        data: customers = [],
    } = useQuery({
        queryKey: ['customers'],
        queryFn: async () => {
            const response = await api.get<User[]>('/users/customers');
            return response.data;
        },
    });

    // UI state for sticky top bar
    const [activeTab, setActiveTab] = useState<'forms' | 'search' | 'select'>('forms');
    const [contentExpanded, setContentExpanded] = useState(false);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);

    // Selection mode states
    const [selectionMode, setSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

    // Search & filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatuses, setSelectedStatuses] = useState<Set<OrderStatus>>(new Set());
    const [sortBy, setSortBy] = useState<'created_at' | 'total_amount' | 'customer_name' | 'status'>('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc'); // newest first by default

    // Pagination (client-side)
    const [page, setPage] = useState(1);
    const perPage = 10;

    useEffect(() => {
        setTitle('Orders');
    }, [setTitle]);

    // ResizeObserver for sticky header (kept for future table header)
    useEffect(() => {
        if (!tabBarRef.current) return;
        const observer = new ResizeObserver(() => {});
        observer.observe(tabBarRef.current);
        return () => observer.disconnect();
    }, []);

    // Filter and sort orders
    const filteredOrders = orders
        .filter(order => {
            const term = searchTerm.toLowerCase();

            // Search in customer name
            const customerName = order.user?.name?.toLowerCase() || '';
            if (customerName.includes(term)) return true;

            // Search in order description
            const description = order.description?.toLowerCase() || '';
            if (description.includes(term)) return true;

            // Search in order items (menu item name and category)
            if (order.order_items) {
                for (const item of order.order_items) {
                    const menuItemName = item.inventory_log?.menu_item?.name?.toLowerCase() || '';
                    if (menuItemName.includes(term)) return true;

                    const categoryName = item.inventory_log?.menu_item?.category?.name?.toLowerCase() || '';
                    if (categoryName.includes(term)) return true;
                }
            }

            return false;
        })
        .filter(order => {
            const matchesStatus = selectedStatuses.size === 0 || selectedStatuses.has(order.order_status);
            return matchesStatus;
        })
        .sort((a, b) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            let aVal: any, bVal: any;
            switch (sortBy) {
                case 'created_at':
                    aVal = a.created_at ? new Date(a.created_at).getTime() : 0;
                    bVal = b.created_at ? new Date(b.created_at).getTime() : 0;
                    break;
                case 'total_amount':
                    aVal = a.total_amount;
                    bVal = b.total_amount;
                    break;
                case 'customer_name':
                    aVal = a.user?.name || '';
                    bVal = b.user?.name || '';
                    break;
                case 'status':
                    aVal = a.order_status;
                    bVal = b.order_status;
                    break;
                default:
                    return 0;
            }

            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            } else {
                return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
            }
        });

    // Reset to page 1 when filters change
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPage(1);
    }, [searchTerm, selectedStatuses, sortBy, sortOrder]);

    // Paginated items
    const totalPages = Math.ceil(filteredOrders.length / perPage);
    const paginatedOrders = filteredOrders.slice((page - 1) * perPage, page * perPage);

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

    // Status update mutation – using the dedicated endpoint
    const statusUpdateMutation = useMutation({
        mutationFn: ({ id, status }: { id: number; status: string }) =>
            api.patch(`/orders/${id}/status`, { order_status: status }),
        onSuccess: (_data, { id, status }) => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            showToast(`Order #${id} status updated to ${status}`, 'success');
        },
        onError: (error) => {
            const message = axios.isAxiosError(error)
                ? error.response?.data?.message || error.message
                : 'Failed to update status';
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

    const handleStatusChange = async (orderId: number, newStatus: string) => {
        await statusUpdateMutation.mutateAsync({ id: orderId, status: newStatus });
    };

    const handleToggleItemSelection = (id: number) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
    };

    // Filter handlers
    const handleStatusToggle = (status: OrderStatus) => {
        setSelectedStatuses(prev => {
            const newSet = new Set(prev);
            if (newSet.has(status)) newSet.delete(status);
            else newSet.add(status);
            return newSet;
        });
    };

    const handleSortChange = (by: typeof sortBy, order: typeof sortOrder) => {
        setSortBy(by);
        setSortOrder(order);
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setSelectedStatuses(new Set());
        setSortBy('created_at');
        setSortOrder('desc');
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
                                customers={customers}
                                userRole={currentUser?.role}
                            />
                        )}
                        {activeTab === 'search' && (
                            <OrderSearchForm
                                searchTerm={searchTerm}
                                onSearchChange={setSearchTerm}
                                selectedStatuses={selectedStatuses}
                                onStatusToggle={handleStatusToggle}
                                sortBy={sortBy}
                                sortOrder={sortOrder}
                                onSortChange={handleSortChange}
                                onReset={handleResetFilters}
                            />
                        )}
                        {activeTab === 'select' && (
                            <OrderActionForm
                                selectionMode={selectionMode}
                                onToggleMode={() => {
                                    setSelectionMode(!selectionMode);
                                    if (selectionMode) setSelectedIds(new Set());
                                }}
                                onSelectAll={() => setSelectedIds(new Set(paginatedOrders.map(order => order.id)))}
                                onDeleteSelected={async () => {
                                    if (selectedIds.size === 0) {
                                        showToast('No orders selected', 'info');
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
                                }}
                                selectedCount={selectedIds.size}
                            />
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
                        onStatusChange={handleStatusChange}
                        selectionMode={selectionMode}
                        isSelected={selectedIds.has(order.id)}
                        onToggleSelection={handleToggleItemSelection}
                    />
                ))}
                {filteredOrders.length === 0 && (
                    <div className="w-full text-center py-8 text-gray-500 dark:text-gray-400">
                        No orders match your filters.
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