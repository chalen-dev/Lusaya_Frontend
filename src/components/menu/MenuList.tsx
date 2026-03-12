import { useState, useEffect } from 'react';
import api from '../../services/api';
import axios from 'axios';
import { useHeaderTitle } from "../../contexts/HeaderTitleContext.tsx";
import { MenuItemCard } from "./MenuItemCard.tsx";
import type { MenuItem } from "./menuItem.ts";
import { FetchingDetails } from "../common/loading/FetchingDetails.tsx";
import { MenuForm } from "./MenuForm.tsx";
import { showConfirmation, showToast } from '../../utils/swalHelpers';

interface EditingMenuItem {
    id: number;
    name: string;
    price: number;
    code: string;
    category_id: number;
    description?: string;
}

export function MenuList() {
    const { setTitle } = useHeaderTitle();

    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'forms' | 'search'>('forms');
    const [contentExpanded, setContentExpanded] = useState(true);
    const [editingItem, setEditingItem] = useState<EditingMenuItem | null>(null);

    useEffect(() => {
        setTitle('Menu List');
    }, [setTitle]);

    useEffect(() => {
        void fetchMenuItems();
    }, []);

    const fetchMenuItems = async () => {
        try {
            setLoading(true);
            const response = await api.get<MenuItem[]>('/menu-items');
            setMenuItems(response.data);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || err.message || 'Failed to fetch menu items');
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (item: MenuItem) => {
        setEditingItem({
            id: item.id,
            name: item.name,
            price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
            code: item.code,
            category_id: item.category?.id ?? 0,
            description: item.description,
        });
        setActiveTab('forms');
        setContentExpanded(true);
    };

    const handleCancelEdit = () => {
        setEditingItem(null);
    };

    const handleItemAdded = (action: 'add' | 'update') => {
        fetchMenuItems().then(() => {
            if (action === 'add') {
                showToast('Item added successfully', 'success');
            } else {
                showToast('Item updated successfully', 'success');
            }
        });
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

        try {
            await api.delete(`/menu-items/${id}`);
            setMenuItems(prev => prev.filter(item => item.id !== id));
            showToast('Item deleted successfully', 'success');
        } catch (err) {
            let message = 'Delete failed';
            if (axios.isAxiosError(err)) {
                message = err.response?.data?.message || err.message;
            } else if (err instanceof Error) {
                message = err.message;
            }
            alert(message);
        }
    };

    if (loading) {
        return <FetchingDetails />;
    }
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="menu-list-container">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 mb-8">
                <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                if (activeTab === 'forms') {
                                    // Same tab: toggle expansion
                                    setContentExpanded(!contentExpanded);
                                } else {
                                    // Different tab: switch and expand
                                    setActiveTab('forms');
                                    setEditingItem(null);
                                    setContentExpanded(true);
                                }
                            }}
                            className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
                                activeTab === 'forms'
                                    ? 'text-primary border-b-2 border-primary'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                        >
                            <i className={`fas fa-${editingItem ? 'pen' : 'plus-circle'} mr-2`} />
                            {editingItem ? 'Edit Item' : 'Add Item'}
                        </button>
                        <button
                            onClick={() => {
                                if (activeTab === 'search') {
                                    // Same tab: toggle expansion
                                    setContentExpanded(!contentExpanded);
                                } else {
                                    // Different tab: switch and expand
                                    setActiveTab('search');
                                    setContentExpanded(true);
                                }
                            }}
                            className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
                                activeTab === 'search'
                                    ? 'text-primary border-b-2 border-primary'
                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                            }`}
                        >
                            <i className="fas fa-search mr-2" />
                            Search
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={() => setContentExpanded(!contentExpanded)}
                        className="flex items-center gap-5 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                        aria-label={contentExpanded ? 'Hide content' : 'Show content'}
                    >
                        {contentExpanded ? 'Hide' : 'Show'}
                        <i className={`fas fa-chevron-${contentExpanded ? 'up' : 'down'} text-primary`} />
                    </button>
                </div>

                {activeTab === 'forms' && contentExpanded && (
                    <MenuForm
                        onItemAdded={handleItemAdded}
                        onCancel={handleCancelEdit}
                        noCard={true}
                        editingItem={editingItem}
                    />
                )}

                {activeTab === 'search' && contentExpanded && (
                    <div className="py-12 text-center text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                        <i className="fas fa-search text-4xl mb-3 opacity-50" />
                        <p>Search form coming soon</p>
                    </div>
                )}
            </div>

            <div className="cards-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.1rem' }}>
                {menuItems.map(item => (
                    <MenuItemCard
                        key={item.id}
                        item={item}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                    />
                ))}
            </div>
        </div>
    );
}