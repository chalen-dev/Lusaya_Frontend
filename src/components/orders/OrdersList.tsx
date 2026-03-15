import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import axios from 'axios';
import { useHeaderTitle } from '../../contexts/HeaderTitleContext';
import { FetchingDetails } from '../common/loading/FetchingDetails';
import { Pagination } from '../common/Pagination';
import { TabBar } from '../common/TabBar';
import { TableHeader, type Column } from '../common/TableHeader';
import { showToast, showConfirmation } from '../../utils/swalHelpers';
import { OrderForm } from './forms/OrderForm';
import { OrderSearchForm } from './forms/OrderSearchForm';
import { type Order, type User, type OrderStatus, STATUS_PRIORITY } from './orderTypes';
import type { InventoryLog } from '../inventory/inventoryTypes';
import { OrderActionForm } from './forms/OrderActionForm';
import { OrderRow } from './partials/OrderRow.tsx';

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

    // Expanded row state
    const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

    // Pagination (client-side)
    const [page, setPage] = useState(1);
    const perPage = 10;

    useEffect(() => {
        setTitle('Orders');
    }, [setTitle]);

    // Helper to get date string (YYYY-MM-DD) for grouping
    const getDayKey = (dateString?: string) => {
        if (!dateString) return '0000-00-00';
        return dateString.split('T')[0];
    };

    // Filter and sort orders with day grouping
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
            // 1. Group by day descending (latest day first)
            const dayA = getDayKey(a.created_at);
            const dayB = getDayKey(b.created_at);
            if (dayA !== dayB) {
                return dayB.localeCompare(dayA); // descending by day
            }

            // 2. Same day: apply user-selected sorting
            let aVal, bVal;
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
                    aVal = STATUS_PRIORITY[a.order_status] ?? 99;
                    bVal = STATUS_PRIORITY[b.order_status] ?? 99;
                    break;
                default:
                    return 0;
            }

            if (typeof aVal === 'string' && typeof bVal === 'string') {
                return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
            } else {
                const aNum = Number(aVal);
                const bNum = Number(bVal);
                return sortOrder === 'asc' ? aNum - bNum : bNum - aNum;
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

    const handleOrderAdded = (action: 'add' | 'update') => {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.invalidateQueries({ queryKey: ['inventory-logs'] });
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

    const orderColumns: Column[] = [
        { key: 'id', label: 'ID', width: selectionMode ? 'w-20' : 'w-16' },
        { key: 'customer', label: 'Customer', width: 'flex-1' },
        { key: 'status', label: 'Status', width: 'w-24', align: 'center' },
        { key: 'total', label: 'Total', width: 'w-28', align: 'right' },
        { key: 'items', label: 'Items', width: 'w-20', align: 'center' },
        { key: 'created', label: 'Created', width: 'w-28', align: 'center' },
        { key: 'updated', label: 'Updated', width: 'w-28', align: 'center' },
        { key: 'actions', label: 'Actions', width: 'w-40', align: 'right' },
        { key: 'expand', label: '', width: 'w-8', align: 'center' },
    ];

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

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    {filteredOrders.length > 0 && (
                        <TableHeader
                            columns={orderColumns}
                            selectionMode={selectionMode}
                            className="sticky z-10"
                        />
                    )}
                    <tbody>
                    {paginatedOrders.map(order => (
                        <OrderRow
                            key={order.id}
                            order={order}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                            onStatusChange={handleStatusChange}
                            selectionMode={selectionMode}
                            isSelected={selectedIds.has(order.id)}
                            onToggleSelection={handleToggleItemSelection}
                            expanded={expandedOrderId === order.id}
                            onExpandToggle={(id) => setExpandedOrderId(expandedOrderId === id ? null : id)}
                        />
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Empty state */}
            {filteredOrders.length === 0 && (
                <div className="w-full text-center py-8 text-gray-500 dark:text-gray-400">
                    No orders match your filters.
                </div>
            )}

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