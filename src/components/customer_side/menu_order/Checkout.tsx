import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from "../../../services/api.ts";
import { useHeaderTitle } from "../../../contexts/HeaderTitleContext.tsx";
import { useCart } from "../../../contexts/CartContext.tsx";
import { showConfirmation, showToast } from "../../../utils/swalHelpers.ts";
import axios from "axios";

export default function Checkout() {
    const navigate = useNavigate();
    const { setTitle } = useHeaderTitle();
    const { items, totalAmount, clearCart, updateQuantity, removeItem } = useCart();
    const queryClient = useQueryClient();
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        setTitle('Checkout');
    }, [setTitle]);

    const placeOrderMutation = useMutation({
        mutationFn: async () => {
            const inventoryLogs = await Promise.all(
                items.map(async (item) => {
                    try {
                        const response = await api.get(`/menu-items/${item.menuItemId}/best-inventory`);
                        return response.data;
                    } catch (error) {
                        if (axios.isAxiosError(error) && error.response?.status === 404) {
                            throw new Error(`Item "${item.name}" is out of stock`);
                        }
                        throw error;
                    }
                })
            );

            const orderPayload = {
                order_status: 'pending',
                description: 'Customer order',
            };
            const orderRes = await api.post('/orders', orderPayload);
            const orderId = orderRes.data.id;

            const itemPromises = items.map((item, index) => {
                const inventoryLog = inventoryLogs[index];
                return api.post('/order-items', {
                    order_id: orderId,
                    inventory_id: inventoryLog.id,
                    quantity: item.quantity,
                    amount: item.price * item.quantity,
                });
            });
            await Promise.all(itemPromises);
            return orderId;
        },
        onError: (error) => {
            if (error instanceof Error) {
                showToast(error.message, 'error');
            } else {
                showToast('Failed to place order', 'error');
            }
        },
        onSuccess: (orderId) => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            clearCart();
            showToast(`Order #${orderId} placed successfully!`, 'success');
            navigate('/myOrders');
        },
    });

    const handlePlaceOrder = async () => {
        if (items.length === 0) {
            showToast('Your cart is empty', 'info');
            navigate('/menuOrder');
            return;
        }
        const confirmed = await showConfirmation(
            'Confirm Order',
            `Place order for ₱${totalAmount.toFixed(2)}?`,
            'question',
            'Yes, place order'
        );
        if (!confirmed) return;
        setSubmitting(true);
        try {
            await placeOrderMutation.mutateAsync();
        } finally {
            setSubmitting(false);
        }
    };

    // If cart becomes empty after removals, redirect
    if (items.length === 0) {
        return (
            <div className="container mx-auto p-4 sm:p-6 text-center">
                <p className="text-gray-500 dark:text-gray-400">Your cart is empty.</p>
                <button
                    onClick={() => navigate('/menuOrder')}
                    className="mt-4 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark"
                >
                    Browse Menu
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-6">Checkout</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                {/* Order items */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Items</h3>
                        <div className="space-y-4">
                            {items.map((item) => (
                                <div key={item.menuItemId} className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center border-b border-gray-200 dark:border-gray-700 pb-4 gap-3">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900 dark:text-white">{item.name}</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">₱{item.price.toFixed(2)} each</p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                                            disabled={item.quantity <= 1}
                                            className="w-8 h-8 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                                        >
                                            -
                                        </button>
                                        <span className="w-8 text-center text-gray-900 dark:text-white">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                                            className="w-8 h-8 bg-green-500 text-white rounded hover:bg-green-600"
                                        >
                                            +
                                        </button>
                                    </div>

                                    <span className="font-medium text-gray-900 dark:text-white sm:mx-4">
                                        ₱{(item.price * item.quantity).toFixed(2)}
                                    </span>

                                    <button
                                        onClick={async () => {
                                            const confirmed = await showConfirmation(
                                                'Remove Item',
                                                `Remove ${item.name} from your cart?`,
                                                'question',
                                                'Yes, remove'
                                            );
                                            if (confirmed) {
                                                removeItem(item.menuItemId);
                                            }
                                        }}
                                        className="text-red-500 hover:text-red-700 self-end sm:self-center"
                                    >
                                        <i className="fas fa-trash" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Order summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6 lg:sticky lg:top-24">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                                <span className="font-medium text-gray-900 dark:text-white">₱{totalAmount.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Delivery Fee</span>
                                <span className="font-medium text-gray-900 dark:text-white">₱0.00</span>
                            </div>
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                                <div className="flex justify-between font-bold text-base sm:text-lg">
                                    <span className="text-green-600 dark:text-green-400">Total</span>
                                    <span className="text-green-600 dark:text-green-400">₱{totalAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handlePlaceOrder}
                            disabled={submitting}
                            className="w-full mt-6 bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50"
                        >
                            {submitting ? 'Placing Order...' : 'Place Order'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}