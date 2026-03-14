// components/orders/forms/OrderForm.tsx
import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import axios from 'axios';
import { TextArea } from '../../common/input/TextArea';
import { LoadingSpinner } from '../../common/loading/LoadingSpinner';
import { showConfirmation } from '../../../utils/swalHelpers';
import { SearchableSelect } from '../../common/input/SearchableSelect';
import type { Order, User } from '../orderTypes';
import type { InventoryLog } from '../../inventory/inventoryTypes';
import { OrderItemSelectorModal } from './OrderItemSelectorModal.tsx';

interface OrderFormProps {
    onOrderAdded?: (action: 'add' | 'update') => void;
    onCancel?: () => void;
    noCard?: boolean;
    editingOrder?: Order | null;
    inventoryLogs: InventoryLog[];
    users: User[];
}

export function OrderForm({
                              onOrderAdded,
                              onCancel,
                              noCard = false,
                              editingOrder,
                              inventoryLogs,
                              users
                          }: OrderFormProps) {
    const [description, setDescription] = useState<string>('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userSearchTerm, setUserSearchTerm] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({
        description: '',
        user_id: '',
    });

    // Item selection state
    const [selectedItems, setSelectedItems] = useState<{ inventoryId: number; quantity: number }[]>([]);
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);

    // Populate form when editing
    useEffect(() => {
        if (editingOrder) {
            setDescription(editingOrder.description || '');
            // Find and set the user
            const user = users.find(u => u.id === editingOrder.user_id);
            setSelectedUser(user || null);
            if (user) {
                setUserSearchTerm(user.name);
            }
            // For edit, we could load existing items, but we'll keep it simple for now
            setSelectedItems([]);
        } else {
            resetForm();
        }
    }, [editingOrder, users]);

    const resetForm = () => {
        setDescription('');
        setSelectedUser(null);
        setUserSearchTerm('');
        setSelectedItems([]);
        setErrors({ description: '', user_id: '' });
    };

    const handleCancel = () => {
        resetForm();
        if (onCancel) onCancel();
    };

    // Compute total amount based on selected items and their prices
    const totalAmount = selectedItems.reduce((sum, item) => {
        const log = inventoryLogs.find(l => l.id === item.inventoryId);
        const price = log?.menu_item?.price || 0;
        return sum + price * item.quantity;
    }, 0);

    // Handle adding items from modal
    const handleAddItems = (items: { inventoryId: number; quantity: number }[]) => {
        setSelectedItems(prev => {
            const map = new Map(prev.map(i => [i.inventoryId, i]));
            items.forEach(i => map.set(i.inventoryId, i));
            return Array.from(map.values());
        });
    };

    const handleRemoveItem = (inventoryId: number) => {
        setSelectedItems(prev => prev.filter(i => i.inventoryId !== inventoryId));
    };

    const handleQuantityChange = (inventoryId: number, newQuantity: number) => {
        if (newQuantity < 1) return;
        setSelectedItems(prev =>
            prev.map(i => (i.inventoryId === inventoryId ? { ...i, quantity: newQuantity } : i))
        );
    };

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();

        // Validate user selection
        const newErrors = {
            description: '',
            user_id: selectedUser ? '' : 'Customer is required',
        };
        setErrors(newErrors);
        if (Object.values(newErrors).some(e => e !== '')) return;

        if (editingOrder) {
            const confirmed = await showConfirmation(
                'Confirm Update',
                'Are you sure you want to update this order?',
                'question',
                'Yes, update'
            );
            if (!confirmed) return;
        }

        setSubmitting(true);

        try {
            let orderId: number;
            if (editingOrder) {
                // Update order metadata
                await api.put(`/orders/${editingOrder.id}`, {
                    order_status: 'pending',
                    description: description || null,
                    user_id: selectedUser!.id,
                });
                orderId = editingOrder.id;
            } else {
                // Create order with user_id
                const createRes = await api.post('/orders', {
                    order_status: 'pending',
                    description: description || null,
                    user_id: selectedUser!.id,
                });
                orderId = createRes.data.id;

                // Create order items if any
                if (selectedItems.length > 0) {
                    const itemPromises = selectedItems.map(item => {
                        const log = inventoryLogs.find(l => l.id === item.inventoryId);
                        if (!log) throw new Error('Inventory log not found');
                        const amount = (log.menu_item?.price || 0) * item.quantity;
                        return api.post('/order-items', {
                            order_id: orderId,
                            inventory_id: item.inventoryId,
                            quantity: item.quantity,
                            amount,
                        });
                    });
                    await Promise.all(itemPromises);
                }
            }

            resetForm();
            if (onOrderAdded) onOrderAdded(editingOrder ? 'update' : 'add');
        } catch (err) {
            let message = editingOrder ? 'Failed to update order' : 'Failed to create order';
            if (axios.isAxiosError(err)) {
                message = err.response?.data?.message || err.message;
                if (err.response?.data?.errors) {
                    const backendErrors = err.response.data.errors;
                    setErrors(prev => ({
                        ...prev,
                        description: backendErrors.description?.[0] || '',
                        user_id: backendErrors.user_id?.[0] || '',
                    }));
                }
            } else if (err instanceof Error) {
                message = err.message;
            }
            if (!axios.isAxiosError(err) || !err.response?.data?.errors) {
                alert(message);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const renderItemsSection = () => (
        <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Order Items</h4>
                <button
                    type="button"
                    onClick={() => setIsSelectorOpen(true)}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Add Items
                </button>
            </div>
            {selectedItems.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">No items added yet.</p>
            ) : (
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Item</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Price</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Qty</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                            <th className="px-3 py-2 w-10"></th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {selectedItems.map(item => {
                            const log = inventoryLogs.find(l => l.id === item.inventoryId);
                            const price = log?.menu_item?.price || 0;
                            return (
                                <tr key={item.inventoryId}>
                                    <td className="px-3 py-2 text-gray-900 dark:text-gray-100">
                                        {log?.menu_item?.name || `Item #${item.inventoryId}`}
                                    </td>
                                    <td className="px-3 py-2 text-right text-gray-600 dark:text-gray-400">
                                        ₱{Number(price).toFixed(2)}
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        <input
                                            type="number"
                                            min={1}
                                            value={item.quantity}
                                            onChange={(e) =>
                                                handleQuantityChange(item.inventoryId, parseInt(e.target.value) || 1)
                                            }
                                            className="w-16 px-2 py-1 text-right border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                                        />
                                    </td>
                                    <td className="px-3 py-2 text-right font-medium text-gray-900 dark:text-gray-100">
                                        ₱{(price * item.quantity).toFixed(2)}
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveItem(item.inventoryId)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <i className="fas fa-trash" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                        <tfoot className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <td colSpan={3} className="px-3 py-2 text-right font-medium text-gray-700 dark:text-gray-300">Total:</td>
                            <td className="px-3 py-2 text-right font-bold text-gray-900 dark:text-white">₱{totalAmount.toFixed(2)}</td>
                            <td></td>
                        </tr>
                        </tfoot>
                    </table>
                </div>
            )}
            <OrderItemSelectorModal
                isOpen={isSelectorOpen}
                onClose={() => setIsSelectorOpen(false)}
                onSelect={handleAddItems}
                existingSelections={selectedItems}
                inventoryLogs={inventoryLogs}
            />
        </div>
    );

    const formContent = (
        <>
            {!editingOrder && renderItemsSection()}

            <TextArea
                label="Description (optional)"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                error={errors.description}
                rows={3}
                className="mb-4"
            />

            <SearchableSelect
                items={users}
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                onSelect={(user) => {
                    setSelectedUser(user);
                    setUserSearchTerm(user.name);
                }}
                selectedItem={selectedUser}
                getItemLabel={(user) => user.name}
                getItemValue={(user) => user.id}
                renderItem={(user) => (
                    <>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            {user.email} ({user.role})
                        </div>
                    </>
                )}
                error={errors.user_id}
                required
                label="Customer"
                placeholder="Search by name or email..."
                className="mb-4"
            />

            <div className="flex justify-end items-center gap-4">
                <button
                    type="button"
                    onClick={handleCancel}
                    disabled={submitting}
                    className="px-4 py-2 bg-gray-500 text-white font-medium text-sm rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                    {editingOrder ? 'Cancel' : 'Clear'}
                </button>
                <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-primary text-white font-medium text-sm rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                    {submitting ? (
                        <span className="flex items-center gap-2">
                            <LoadingSpinner size={16} />
                            {editingOrder ? 'Updating...' : 'Creating...'}
                        </span>
                    ) : (
                        editingOrder ? 'Update Order' : 'Create Order'
                    )}
                </button>
            </div>
        </>
    );

    if (noCard) {
        return <form onSubmit={handleSubmit}>{formContent}</form>;
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 mb-8">
            {formContent}
        </form>
    );
}