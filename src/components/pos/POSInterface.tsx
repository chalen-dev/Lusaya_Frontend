// components/pos/POSInterface.tsx
import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { showToast, showConfirmation } from '../../utils/swalHelpers';
import { Header } from '../common/Header';
import { useHeaderTitle } from '../../contexts/HeaderTitleContext';
import { LoadingScreen } from '../common/loading/LoadingScreen';
import { SearchHeader } from '../common/forms_search_filter/SearchHeader';
import { FilterButton } from '../common/forms_search_filter/FilterButton';
import { ProductGrid } from './partials/ProductGrid';
import { Cart } from './partials/Cart';
import { PaymentSection } from './partials/PaymentSection';
import type { InventoryLog } from '../inventory/inventoryTypes';
import type { User } from '../orders/orderTypes';
import type { Category } from '../menu/menuTypes';

interface CartItem {
    inventoryId: number;
    menuItem: {
        name: string;
        price: number;
        code: string | null;
    };
    quantity: number;
    unitPrice: number;
}

export default function POSInterface() {
    const queryClient = useQueryClient();
    const { setTitle } = useHeaderTitle();
    const [searchTerm, setSearchTerm] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [page, setPage] = useState(1);
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const perPage = 9;
    const [tenderedAmount, setTenderedAmount] = useState<number>(0);

    useEffect(() => {
        setTitle('Point of Sale');
    }, [setTitle]);

    const { data: currentUser } = useQuery({
        queryKey: ['currentUser'],
        queryFn: async () => {
            const response = await api.get('/user');
            return response.data as User;
        },
    });

    const { data: posCustomer, isLoading: posLoading } = useQuery({
        queryKey: ['pos-customer'],
        queryFn: async () => {
            const response = await api.get<User>('/users/pos');
            return response.data;
        },
    });

    const { data: categories = [] } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await api.get<Category[]>('/categories');
            return response.data;
        },
    });

    const {
        data: inventoryLogs = [],
        isLoading: logsLoading,
    } = useQuery({
        queryKey: ['inventory-logs-pos'],
        queryFn: async () => {
            const response = await api.get<InventoryLog[]>('/inventory-logs/available-pos');
            return response.data;
        },
    });

    const getStockPriority = (log: InventoryLog): number => {
        const qty = log.quantity_in_stock;
        if (qty > 10) return 1;
        if (qty > 0) return 2;
        return 3;
    };

    const processedLogs = useMemo(() => {
        return inventoryLogs
            .filter(log => {
                const term = searchTerm.toLowerCase();
                const matchesSearch =
                    log.menu_item?.name.toLowerCase().includes(term) ||
                    log.menu_item?.code?.toLowerCase().includes(term) ||
                    log.menu_item?.category?.name?.toLowerCase().includes(term);
                const matchesCategory = !selectedCategoryId || log.menu_item?.category?.id === selectedCategoryId;
                return matchesSearch && matchesCategory;
            })
            .sort((a, b) => {
                const priorityA = getStockPriority(a);
                const priorityB = getStockPriority(b);
                if (priorityA !== priorityB) return priorityA - priorityB;
                const nameA = a.menu_item?.name || '';
                const nameB = b.menu_item?.name || '';
                return nameA.localeCompare(nameB);
            });
    }, [inventoryLogs, searchTerm, selectedCategoryId]);

    const totalPages = Math.ceil(processedLogs.length / perPage);
    const paginatedLogs = processedLogs.slice((page - 1) * perPage, page * perPage);

    const addToCart = (log: InventoryLog) => {
        if (log.quantity_in_stock <= 0) {
            showToast('Item is out of stock', 'info');
            return;
        }
        const existing = cart.find(item => item.inventoryId === log.id);
        if (existing) {
            setCart(cart.map(item =>
                item.inventoryId === log.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setCart([...cart, {
                inventoryId: log.id,
                menuItem: {
                    name: log.menu_item!.name,
                    price: Number(log.menu_item!.price),
                    code: log.menu_item!.code,
                },
                quantity: 1,
                unitPrice: Number(log.menu_item!.price),
            }]);
        }
    };

    const updateQuantity = (inventoryId: number, newQuantity: number) => {
        if (newQuantity < 1) return;
        setCart(cart.map(item =>
            item.inventoryId === inventoryId
                ? { ...item, quantity: newQuantity }
                : item
        ));
    };

    const removeFromCart = (inventoryId: number) => {
        setCart(cart.filter(item => item.inventoryId !== inventoryId));
    };

    const totalAmount = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const change = Math.max(0, tenderedAmount - totalAmount);

    const checkoutMutation = useMutation({
        mutationFn: async () => {
            if (!posCustomer) throw new Error('POS customer not loaded');
            const orderPayload = {
                order_status: 'completed',
                description: 'POS sale',
                user_id: posCustomer.id,
            };
            const orderRes = await api.post('/orders/for-customer', orderPayload);
            const orderId = orderRes.data.id;

            const itemPromises = cart.map(item =>
                api.post('/order-items', {
                    order_id: orderId,
                    inventory_id: item.inventoryId,
                    quantity: item.quantity,
                    amount: item.unitPrice * item.quantity,
                })
            );
            await Promise.all(itemPromises);
            return orderId;
        },
        onSuccess: (orderId) => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['inventory-logs-available'] });
            setCart([]);
            setTenderedAmount(0);
            const message = currentUser?.role === 'admin'
                ? `Order #${orderId} completed successfully`
                : 'Order completed successfully';
            showToast(message, 'success');
        },
        onError: (error) => {
            showToast('Failed to complete order', 'error');
            console.error(error);
        },
    });

    const handleCheckout = async () => {
        if (cart.length === 0) {
            showToast('Cart is empty', 'info');
            return;
        }
        if (tenderedAmount < totalAmount) {
            showToast('Insufficient payment', 'error');
            return;
        }
        const confirmed = await showConfirmation(
            'Confirm Order',
            `Complete order for ₱${totalAmount.toFixed(2)}?`,
            'question',
            'Yes, complete'
        );
        if (!confirmed) return;
        checkoutMutation.mutate();
    };


    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPage(1);
    }, [selectedCategoryId]);

    if (logsLoading || posLoading || !currentUser) return <LoadingScreen />;
    if (!posCustomer) return <div className="p-4 text-red-600">POS customer not configured</div>;

    const isOutOfStock = (log: InventoryLog) => log.quantity_in_stock <= 0;

    return (
        <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
            <Header showBackButton onBack={() => window.history.back()} includeIcon={false} />

            <div className="flex-1 flex overflow-hidden p-4 gap-4">
                {/* Left column: product grid with categories */}
                <div className="w-2/5 flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                    <SearchHeader
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name, code, or category..."
                        hideToggle
                        showAdvanced={false}
                        onToggleAdvanced={() => {}}
                        className="mb-4"
                    />

                    <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                        <FilterButton
                            isSelected={selectedCategoryId === null}
                            onClick={() => setSelectedCategoryId(null)}
                        >
                            All
                        </FilterButton>
                        {categories.map(cat => (
                            <FilterButton
                                key={cat.id}
                                isSelected={selectedCategoryId === cat.id}
                                onClick={() => setSelectedCategoryId(cat.id)}
                            >
                                {cat.name}
                            </FilterButton>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <ProductGrid
                            paginatedLogs={paginatedLogs}
                            totalPages={totalPages}
                            currentPage={page}
                            onPageChange={setPage}
                            onAddToCart={addToCart}
                            isOutOfStock={isOutOfStock}
                            columnCount={2}
                        />
                    </div>
                </div>

                {/* Middle column: cart */}
                <div className="w-1/3 flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Cart</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 min-h-0">
                        <Cart
                            cart={cart}
                            onUpdateQuantity={updateQuantity}
                            onRemove={removeFromCart}
                        />
                    </div>
                </div>

                {/* Right column: payment */}
                <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                    <PaymentSection
                        totalAmount={totalAmount}
                        tenderedAmount={tenderedAmount}
                        onTenderedChange={setTenderedAmount}
                        change={change}
                        isProcessing={checkoutMutation.isPending}
                        cartEmpty={cart.length === 0}
                        onCheckout={handleCheckout}
                    />
                </div>
            </div>
        </div>
    );
}