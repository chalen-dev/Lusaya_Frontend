import React, { useState, useEffect } from 'react';
import api from '../../../services/api.ts';
import axios from 'axios';
import { Text } from '../../common/input/Text.tsx';
import { Select } from '../../common/input/Select.tsx';
import { Number } from '../../common/input/Number.tsx';
import { TextArea } from '../../common/input/TextArea.tsx';
import { ImageInput } from '../../common/input/ImageInput.tsx';
import { LoadingSpinner } from '../../common/loading/LoadingSpinner.tsx';
import { showConfirmation } from '../../../utils/swalHelpers.ts';
import { type Category, type EditingMenuItem } from '../menuTypes.ts';

type MenuItemPayload = {
    name: string;
    price: number;
    category_id: number;
    code: string;
    description?: string;
};

interface MenuFormProps {
    onItemAdded?: (action: 'add' | 'update') => void;
    onCancel?: () => void;
    noCard?: boolean;
    editingItem?: EditingMenuItem | null;
}

export function MenuForm({ onItemAdded, onCancel, noCard = false, editingItem }: MenuFormProps) {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [code, setCode] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [description, setDescription] = useState('');
    const [categories, setCategories] = useState<Category[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
    const [showOptional, setShowOptional] = useState(false);
    const [imageCleared, setImageCleared] = useState(false);

    const [errors, setErrors] = useState({
        name: '',
        price: '',
        category: '',
        code: '',
        description: '',
        image: ''
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get<Category[]>('/categories');
                setCategories(response.data);
            } catch (err) {
                console.error('Failed to load categories', err);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        if (editingItem) {
            setName(editingItem.name);
            setPrice(String(editingItem.price));
            setCode(editingItem.code);
            setCategoryId(String(editingItem.category_id));
            setDescription(editingItem.description || '');
            setExistingImageUrl(editingItem.image_url || null);
            setSelectedFile(null);
            setImageCleared(false);
            setShowOptional(!!editingItem.description || !!editingItem.image_url);
        } else {
            setName('');
            setPrice('');
            setCode('');
            setCategoryId('');
            setDescription('');
            setExistingImageUrl(null);
            setSelectedFile(null);
            setImageCleared(false);
            setShowOptional(false);
        }
        setErrors({ name: '', price: '', category: '', code: '', description: '', image: '' });
    }, [editingItem]);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value);
        if (errors.name) setErrors(prev => ({ ...prev, name: '' }));
    };

    const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPrice(e.target.value);
        if (errors.price) setErrors(prev => ({ ...prev, price: '' }));
    };

    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCode(e.target.value);
        if (errors.code) setErrors(prev => ({ ...prev, code: '' }));
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDescription(e.target.value);
        if (errors.description) setErrors(prev => ({ ...prev, description: '' }));
    };

    const handleImageChange = (file: File | null) => {
        setSelectedFile(file);
        if (errors.image) setErrors(prev => ({ ...prev, image: '' }));

        if (file === null && existingImageUrl) {
            setImageCleared(true);
        } else {
            setImageCleared(false);
        }
    };

    const resetForm = () => {
        setName('');
        setPrice('');
        setCode('');
        setCategoryId('');
        setDescription('');
        setSelectedFile(null);
        setExistingImageUrl(null);
        setImageCleared(false);
        setShowOptional(false);
        setErrors({ name: '', price: '', category: '', code: '', description: '', image: '' });
    };

    const handleCancel = () => {
        resetForm();
        if (onCancel) onCancel();
    };

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();

        const newErrors = {
            name: name.trim() ? '' : 'Name is required',
            price: price.trim() ? '' : 'Price is required',
            category: categoryId ? '' : 'Category is required',
            code: code.trim() ? '' : 'Code is required',
            description: '',
            image: ''
        };
        setErrors(newErrors);
        if (newErrors.name || newErrors.price || newErrors.category || newErrors.code) return;

        if (editingItem) {
            const confirmed = await showConfirmation(
                'Confirm Update',
                'Are you sure you want to update this item?',
                'question',
                'Yes, update'
            );
            if (!confirmed) return;
        }

        setSubmitting(true);

        try {
            const basePayload: MenuItemPayload = {
                name,
                price: parseFloat(price),
                category_id: parseInt(categoryId),
                code,
                description: description || undefined
            };

            if (editingItem) {
                if (selectedFile) {
                    const formData = new FormData();
                    formData.append('_method', 'PUT');
                    Object.entries(basePayload).forEach(([key, value]) => {
                        if (value !== undefined) formData.append(key, String(value));
                    });
                    formData.append('photo', selectedFile);
                    await api.post(`/menu-items/${editingItem.id}`, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                } else {
                    const payload = {
                        ...basePayload,
                        ...(imageCleared ? { photo: null } : {})
                    };
                    await api.put(`/menu-items/${editingItem.id}`, payload);
                }
            } else {
                if (selectedFile) {
                    const formData = new FormData();
                    Object.entries(basePayload).forEach(([key, value]) => {
                        if (value !== undefined) formData.append(key, String(value));
                    });
                    formData.append('photo', selectedFile);
                    await api.post('/menu-items', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                } else {
                    await api.post('/menu-items', basePayload);
                }
            }

            resetForm();
            if (onItemAdded) onItemAdded(editingItem ? 'update' : 'add');
        } catch (err) {
            let message = editingItem ? 'Failed to update menu item' : 'Failed to add menu item';
            if (axios.isAxiosError(err)) {
                message = err.response?.data?.message || err.message;
                if (err.response?.data?.errors) {
                    const backendErrors = err.response.data.errors;
                    setErrors(prev => ({
                        ...prev,
                        name: backendErrors.name?.[0] || '',
                        price: backendErrors.price?.[0] || '',
                        category: backendErrors.category_id?.[0] || '',
                        code: backendErrors.code?.[0] || '',
                        description: backendErrors.description?.[0] || '',
                        image: backendErrors.image?.[0] || ''
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <Text
                    name="name"
                    label="Name"
                    value={name}
                    onChange={handleNameChange}
                    error={errors.name}
                    required
                    className="mb-0"
                />
                <Number
                    label="Price"
                    name="price"
                    value={price}
                    onChange={handlePriceChange}
                    min={0}
                    step="0.01"
                    error={errors.price}
                    className="mb-0"
                />
                <Text
                    name="code"
                    label="Code"
                    value={code}
                    onChange={handleCodeChange}
                    error={errors.code}
                    required
                    className="mb-0"
                />
                <Select
                    label="Category"
                    name="categoryId"
                    value={categoryId}
                    onChange={(e) => {
                        setCategoryId(e.target.value);
                        if (errors.category) setErrors(prev => ({ ...prev, category: '' }));
                    }}
                    options={[
                        { value: '', label: 'Select a category' },
                        ...categories.map(cat => ({ value: cat.id, label: cat.name }))
                    ]}
                    error={errors.category}
                    className="mb-0"
                />
            </div>

            <div className="flex justify-start mb-6">
                <button
                    type="button"
                    onClick={() => setShowOptional(!showOptional)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                    <i className={`fas fa-${showOptional ? 'minus' : 'plus'} text-primary`} />
                    {showOptional ? 'Remove optional details' : 'Add image & description'}
                </button>
            </div>

            {showOptional && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <ImageInput
                        name="image"
                        label="Item Image"
                        onChange={handleImageChange}
                        currentImageUrl={existingImageUrl}
                        error={errors.image}
                        disabled={submitting}
                    />
                    <TextArea
                        name="description"
                        label="Description"
                        value={description}
                        onChange={handleDescriptionChange}
                        error={errors.description}
                        rows={4}
                        className="mb-0"
                    />
                </div>
            )}

            <div className="flex justify-end items-center gap-10">
                <button
                    type="button"
                    onClick={handleCancel}
                    disabled={submitting}
                    className="px-6 py-2.5 bg-gray-500 text-white font-medium rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                    {submitting ? (
                        <span className="flex items-center gap-2">
                            <LoadingSpinner size={20} />
                            {editingItem ? 'Updating...' : 'Adding...'}
                        </span>
                    ) : (
                        editingItem ? 'Update Item' : 'Add Item'
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