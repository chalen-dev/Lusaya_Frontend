import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import axios from 'axios';
import { TextArea } from '../../common/input/TextArea';
import { showConfirmation } from '../../../utils/swalHelpers';
import { SearchableSelect } from '../../common/input/SearchableSelect';
import { ORDER_STATUS_OPTIONS } from '../orderTypes';
import type { Order, User } from '../orderTypes';
import type { InventoryLog } from '../../inventory/inventoryTypes';
import { OrderItemSelectorModal } from './order_item/OrderItemSelectorModal';
import { LoadingSpinner } from "../../common/loading/LoadingSpinner";

interface OrderFormProps {
    onOrderAdded?: (action: 'add' | 'update') => void;
    onCancel?: () => void;
    noCard?: boolean;
    editingOrder?: Order | null;
    inventoryLogs: InventoryLog[];
    customers: User[];
    userRole?: string; // 'admin' | 'cashier' | 'customer'
}

export function OrderForm({
                              onOrderAdded,
                              onCancel,
                              noCard = false,
                              editingOrder,
                              inventoryLogs,
                              customers,
                              userRole
                          }: OrderFormProps) {
    const [orderStatus, setOrderStatus] = useState<string>('pending');
    const [description, setDescription] = useState<string>('');
    const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
    const [customerSearchTerm, setCustomerSearchTerm] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({
        description: '',
        customer_id: '',
        order_status: '',
    });

    const [selectedItems, setSelectedItems] = useState<{ inventoryId: number; quantity: number }[]>([]);
    const [isSelectorOpen, setIsSelectorOpen] = useState(false);

    const isStaff = userRole === 'admin' || userRole === 'cashier';

    useEffect(() => {
        if (editingOrder) {
            setOrderStatus(editingOrder.order_status);
            setDescription(editingOrder.description || '');
            if (isStaff) {
                const customer = customers.find(c => c.id === editingOrder.user_id);
                setSelectedCustomer(customer || null);
                if (customer) setCustomerSearchTerm(customer.name);
            }
            setSelectedItems([]);
        } else {
            resetForm();
        }
    }, [editingOrder, customers, isStaff]);

    const resetForm = () => {
        setOrderStatus('pending');
        setDescription('');
        setSelectedCustomer(null);
        setCustomerSearchTerm('');
        setSelectedItems([]);
        setErrors({ description: '', customer_id: '', order_status: '' });
    };

    const handleCancel = () => {
        resetForm();
        if (onCancel) onCancel();
    };

    const totalAmount = selectedItems.reduce((sum, item) => {
        const log = inventoryLogs.find(l => l.id === item.inventoryId);
        const price = log?.menu_item?.price || 0;
        return sum + price * item.quantity;
    }, 0);

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

        const newErrors = {
            description: '',
            customer_id: isStaff && !selectedCustomer ? 'Customer is required' : '',
            order_status: '',
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
                await api.put(`/orders/${editingOrder.id}`, {
                    order_status: orderStatus,
                    description: description || null,
                });
                orderId = editingOrder.id;
            } else {
                let createRes;
                if (isStaff) {
                    createRes = await api.post('/orders/for-customer', {
                        order_status: 'pending',
                        description: description || null,
                        user_id: selectedCustomer!.id,
                    });
                } else {
                    createRes = await api.post('/orders', {
                        order_status: 'pending',
                        description: description || null,
                    });
                }
                orderId = createRes.data.id;

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
                        customer_id: backendErrors.user_id?.[0] || '',
                        order_status: backendErrors.order_status?.[0] || '',
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

    const renderItemsTable = () => (
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
                                <div className="flex items-center justify-end gap-1">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleQuantityChange(item.inventoryId, item.quantity - 1);
                                        }}
                                        disabled={item.quantity <= 1}
                                        className="w-6 h-6 flex items-center justify-center bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white rounded text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        -
                                    </button>
                                    <span className="w-8 text-center text-sm font-medium text-gray-900 dark:text-gray-100">
                                            {item.quantity}
                                        </span>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleQuantityChange(item.inventoryId, item.quantity + 1);
                                        }}
                                        className="w-6 h-6 flex items-center justify-center bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded text-sm font-bold"
                                    >
                                        +
                                    </button>
                                </div>
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
    );

    const formContent = (
        <>
            {/* Adding mode */}
            {!editingOrder && (
                <div className="flex gap-6">
                    {/* Left column: items table */}
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Order Items</h4>
                            <button
                                type="button"
                                onClick={() => setIsSelectorOpen(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium text-sm rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors shadow-md"
                            >
                                <i className="fas fa-plus" />
                                Add Items
                            </button>
                        </div>
                        {selectedItems.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No items added yet.</p>
                        ) : (
                            <div className="max-h-96 overflow-auto">
                                {renderItemsTable()}
                            </div>
                        )}
                    </div>

                    {/* Right column: customer (if staff), description, buttons */}
                    <div className="w-80 flex flex-col space-y-4">
                        {isStaff && (
                            <SearchableSelect
                                items={customers}
                                value={customerSearchTerm}
                                onChange={(e) => setCustomerSearchTerm(e.target.value)}
                                onSelect={(customer) => {
                                    setSelectedCustomer(customer);
                                    setCustomerSearchTerm(customer.name);
                                }}
                                selectedItem={selectedCustomer}
                                getItemLabel={(customer) => customer.name}
                                getItemValue={(customer) => customer.id}
                                renderItem={(customer) => (
                                    <>
                                        <div className="font-medium">{customer.name}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {customer.email}
                                        </div>
                                    </>
                                )}
                                error={errors.customer_id}
                                required
                                label="Customer"
                                placeholder="Search by name or email..."
                            />
                        )}
                        <TextArea
                            label="Description (optional)"
                            name="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            error={errors.description}
                            rows={3}
                        />
                        <div className="flex justify-end gap-4 pt-2">
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
                    </div>
                </div>
            )}

            {/* Editing mode */}
            {editingOrder && (
                <div className="flex gap-6">
                    {/* Left column: items table (editable) */}
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Order Items</h4>
                            <button
                                type="button"
                                onClick={() => setIsSelectorOpen(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium text-sm rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors shadow-md"
                            >
                                <i className="fas fa-plus" />
                                Add Items
                            </button>
                        </div>
                        {selectedItems.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">No items added yet.</p>
                        ) : (
                            <div className="max-h-96 overflow-auto">
                                {renderItemsTable()}
                            </div>
                        )}
                    </div>

                    {/* Right column: customer (read-only), status buttons, description, buttons */}
                    <div className="w-80 flex flex-col space-y-4">
                        {isStaff && (
                            <SearchableSelect
                                items={customers}
                                value={customerSearchTerm}
                                onChange={(e) => setCustomerSearchTerm(e.target.value)}
                                onSelect={(customer) => {
                                    // This won't be called because disabled, but keep for consistency
                                    setSelectedCustomer(customer);
                                    setCustomerSearchTerm(customer.name);
                                }}
                                selectedItem={selectedCustomer}
                                getItemLabel={(customer) => customer.name}
                                getItemValue={(customer) => customer.id}
                                renderItem={(customer) => (
                                    <>
                                        <div className="font-medium">{customer.name}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {customer.email}
                                        </div>
                                    </>
                                )}
                                error={errors.customer_id}
                                required={false}
                                label="Customer"
                                placeholder="Customer"
                                disabled={true} // Read-only during edit
                            />
                        )}

                        {/* Status buttons */}
                        <div>
                            <span className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Order Status</span>
                            <div className="flex flex-wrap gap-2">
                                {ORDER_STATUS_OPTIONS.map(option => {
                                    const isCurrent = option.value === orderStatus;
                                    return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            onClick={() => setOrderStatus(option.value)}
                                            className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                                                isCurrent
                                                    ? 'bg-primary text-white border-primary ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-800'
                                                    : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                            }`}
                                        >
                                            {option.label}
                                        </button>
                                    );
                                })}
                            </div>
                            {errors.order_status && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.order_status}</p>
                            )}
                        </div>

                        <TextArea
                            label="Description (optional)"
                            name="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            error={errors.description}
                            rows={3}
                        />

                        <div className="flex justify-end gap-4 pt-2">
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={submitting}
                                className="px-4 py-2 bg-gray-500 text-white font-medium text-sm rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-4 py-2 bg-primary text-white font-medium text-sm rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                            >
                                {submitting ? (
                                    <span className="flex items-center gap-2">
                            <LoadingSpinner size={16} />
                            Updating...
                        </span>
                                ) : (
                                    'Update Order'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <OrderItemSelectorModal
                isOpen={isSelectorOpen}
                onClose={() => setIsSelectorOpen(false)}
                onSelect={handleAddItems}
                existingSelections={selectedItems}
                inventoryLogs={inventoryLogs}
            />
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