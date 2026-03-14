// InventoryForm.tsx
import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import axios from 'axios';
import { DateInput } from '../../common/input/DateInput';
import { Number } from '../../common/input/Number';
import { TextArea } from '../../common/input/TextArea';
import { showConfirmation } from '../../../utils/swalHelpers';
import type { InventoryLog, MenuItem } from '../inventoryTypes';
import { SearchableSelect } from "../../common/input/SearchableSelect";
import {CancelButton} from "../../common/forms_main/CancelButton.tsx";
import {SubmitButton} from "../../common/forms_main/SubmitButton.tsx";

interface InventoryFormProps {
    onItemAdded?: (action: 'add' | 'update') => void;
    onCancel?: () => void;
    noCard?: boolean;
    editingItem?: InventoryLog | null;
    menuItems: MenuItem[];
    menuItemsLoading: boolean;
}

export function InventoryForm({
                                  onItemAdded,
                                  onCancel,
                                  noCard = false,
                                  editingItem,
                                  menuItems,
                                  menuItemsLoading
                              }: InventoryFormProps) {
    // Form fields
    const [itemId, setItemId] = useState<number | null>(null);
    const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItem | null>(null);
    const [quantity, setQuantity] = useState<string>('');
    const [dateAcquired, setDateAcquired] = useState<string>('');
    const [expiryDate, setExpiryDate] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [isAvailable, setIsAvailable] = useState<boolean>(false);
    const [inventoryStatus, setInventoryStatus] = useState<string>('in_stock'); // still used for backend

    const [searchTerm, setSearchTerm] = useState<string>('');

    const [submitting, setSubmitting] = useState<boolean>(false);
    const [errors, setErrors] = useState({
        item_id: '',
        quantity: '',
        date_acquired: '',
        expiry_date: '',
        is_available: '',
        description: '',
    });

    // Populate form when editing
    useEffect(() => {
        if (editingItem) {
            setItemId(editingItem.item_id);
            setSelectedMenuItem(editingItem.menu_item || null);
            setQuantity(String(editingItem.quantity_in_stock));
            setDateAcquired(editingItem.date_acquired || '');
            setExpiryDate(editingItem.expiry_date || '');
            setDescription(editingItem.description || '');
            setIsAvailable(editingItem.is_available);
            setInventoryStatus(editingItem.inventory_status || 'in_stock');
            if (editingItem.menu_item) {
                setSearchTerm(editingItem.menu_item.name);
            }
        } else {
            resetForm();
        }
    }, [editingItem]);

    const resetForm = () => {
        setItemId(null);
        setSelectedMenuItem(null);
        setQuantity('');
        setDateAcquired('');
        setExpiryDate('');
        setDescription('');
        setIsAvailable(false);
        setInventoryStatus('in_stock');
        setSearchTerm('');
        setErrors({
            item_id: '',
            quantity: '',
            date_acquired: '',
            expiry_date: '',
            is_available: '',
            description: '',
        });
    };

    const handleCancel = () => {
        resetForm();
        if (onCancel) onCancel();
    };

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();

        const newErrors = {
            item_id: itemId ? '' : 'Please select a menu item',
            quantity: quantity.trim() ? '' : 'Quantity is required',
            date_acquired: dateAcquired ? '' : 'Date acquired is required',
            expiry_date: expiryDate ? '' : 'Expiry date is required',
            is_available: '',
            description: '',
        };

        const quantityNum = parseFloat(quantity);
        if (quantity && (isNaN(quantityNum) || quantityNum < 0)) {
            newErrors.quantity = 'Quantity must be a positive number';
        }

        if (dateAcquired && expiryDate) {
            const acquired = new Date(dateAcquired);
            const expiry = new Date(expiryDate);
            if (expiry < acquired) {
                newErrors.expiry_date = 'Expiry date cannot be before acquisition date';
            }
        }

        setErrors(newErrors);
        if (Object.values(newErrors).some(e => e !== '')) return;

        if (editingItem) {
            const confirmed = await showConfirmation(
                'Confirm Update',
                'Are you sure you want to update this inventory record?',
                'question',
                'Yes, update'
            );
            if (!confirmed) return;
        }

        setSubmitting(true);

        const payload = {
            item_id: itemId!,
            quantity_in_stock: quantityNum,
            date_acquired: dateAcquired,
            expiry_date: expiryDate,
            description: description || null,
            is_available: isAvailable,
            inventory_status: inventoryStatus,
        };

        try {
            if (editingItem) {
                await api.put(`/inventory-logs/${editingItem.id}`, payload);
            } else {
                await api.post('/inventory-logs', payload);
            }
            resetForm();
            if (onItemAdded) onItemAdded(editingItem ? 'update' : 'add');
        } catch (err) {
            let message = editingItem ? 'Failed to update inventory log' : 'Failed to add inventory log';
            if (axios.isAxiosError(err)) {
                message = err.response?.data?.message || err.message;
                if (err.response?.data?.errors) {
                    const backendErrors = err.response.data.errors;
                    setErrors(prev => ({
                        ...prev,
                        item_id: backendErrors.item_id?.[0] || '',
                        quantity: backendErrors.quantity_in_stock?.[0] || '',
                        date_acquired: backendErrors.date_acquired?.[0] || '',
                        expiry_date: backendErrors.expiry_date?.[0] || '',
                        is_available: backendErrors.is_available?.[0] || '',
                        description: backendErrors.description?.[0] || '',
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

    const formContent = (
        <>
            {/* Menu Item Search */}
            <SearchableSelect
                items={menuItems}
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    if (itemId) {
                        setItemId(null);
                        setSelectedMenuItem(null);
                    }
                }}
                onSelect={(item) => {
                    setSelectedMenuItem(item);
                    setItemId(item.id);
                    setSearchTerm(item.name);
                }}
                selectedItem={selectedMenuItem}
                getItemLabel={(item) => item.name}
                getItemValue={(item) => item.id}
                renderItem={(item) => (
                    <>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            Code: {item.code} | Price: ₱{item.price}
                        </div>
                    </>
                )}
                error={errors.item_id}
                required
                label="Menu Item"
                placeholder="Search by name or code..."
                loading={menuItemsLoading}
                className="mb-3"
            />

            {/* Three‑column row: Quantity, Acquired, Expires */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <Number
                    label="Quantity"
                    name="quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min={0}
                    step="any"
                    error={errors.quantity}
                    required
                />
                <DateInput
                    label="Acquired"
                    name="date_acquired"
                    value={dateAcquired}
                    onChange={(e) => setDateAcquired(e.target.value)}
                    error={errors.date_acquired}
                    required
                />
                <DateInput
                    label="Expires"
                    name="expiry_date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    error={errors.expiry_date}
                    required
                />
            </div>

            <TextArea
                label="Description (optional)"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                error={errors.description}
                rows={2}
                className="mb-3"
            />

            <div className="flex justify-end items-center gap-10">
                <CancelButton
                    onClick={handleCancel}
                    disabled={submitting}
                    label={editingItem ? 'Cancel' : 'Clear'}
                    className="px-4 py-2 text-sm"
                />
                <SubmitButton
                    submitting={submitting}
                    isEditing={!!editingItem}
                    addLabel="Add"
                    updateLabel="Update"
                    submittingAddLabel="Adding..."
                    submittingUpdateLabel="Updating..."
                    className="px-4 py-2 text-sm"
                />
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