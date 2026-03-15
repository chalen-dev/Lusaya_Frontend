import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useHeaderTitle } from '../../../contexts/HeaderTitleContext';
import { useCart } from '../../../contexts/CartContext';
import api from '../../../services/api';
import type { MenuItem } from '../../menu/menuTypes';
import type { Category } from '../../menu/menuTypes';
import { LoadingScreen } from "../../common/loading/LoadingScreen";

interface ItemWithStock {
    item: MenuItem;
    inStock: boolean;
}

export default function FoodChoices() {
    const { categoryId } = useParams<{ categoryId: string }>();
    const { setTitle } = useHeaderTitle();
    const { addItem } = useCart();
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [showModal, setShowModal] = useState(false);

    // Fetch category name
    const { data: categories } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await api.get<Category[]>('/categories');
            return response.data;
        },
    });

    const category = categories?.find(c => c.id === Number(categoryId));

    useEffect(() => {
        setTitle(category?.name || 'Menu Items');
    }, [category, setTitle]);

    // Fetch menu items
    const { data: menuItems = [], isLoading: menuLoading } = useQuery({
        queryKey: ['menu-items'],
        queryFn: async () => {
            const response = await api.get<MenuItem[]>('/menu-items');
            return response.data;
        },
    });

    // Memoize filtered items
    const filteredItems = useMemo(
        () => menuItems.filter(item => item.category?.id === Number(categoryId)),
        [menuItems, categoryId]
    );

    // Memoize itemIds
    const itemIds = useMemo(() => filteredItems.map(item => item.id).join(','), [filteredItems]);

    // Fetch stock status
    const { data: stockStatus, isLoading: stockLoading } = useQuery({
        queryKey: ['stock-status', itemIds],
        queryFn: async () => {
            if (!itemIds) return [];
            const response = await api.get<{ id: number; inStock: boolean }[]>(`/menu-items/stock-status?ids=${itemIds}`);
            return response.data;
        },
        enabled: !!itemIds,
    });

    // Compute items with stock directly
    const itemsWithStock = useMemo<ItemWithStock[]>(() => {
        if (!filteredItems.length || !stockStatus) return [];
        const combined = filteredItems.map(item => ({
            item,
            inStock: stockStatus.find(s => s.id === item.id)?.inStock ?? false
        }));
        combined.sort((a, b) => (a.inStock === b.inStock ? 0 : a.inStock ? -1 : 1));
        return combined;
    }, [filteredItems, stockStatus]);

    const handleAddToCart = (item: MenuItem) => {
        setSelectedItem(item);
        setQuantity(1);
        setShowModal(true);
    };

    const confirmAddToCart = () => {
        if (selectedItem) {
            addItem({
                menuItemId: selectedItem.id,
                name: selectedItem.name,
                price: Number(selectedItem.price),
                quantity,
            });
            setShowModal(false);
        }
    };

    if (menuLoading || stockLoading) return <LoadingScreen />;

    return (
        <div className="container mx-auto p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {itemsWithStock.map(({ item, inStock }) => (
                    <div
                        key={item.id}
                        className={`bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-shadow p-4 sm:p-6 border border-gray-200 dark:border-gray-700 flex flex-col ${
                            !inStock ? 'opacity-50' : ''
                        }`}
                    >
                        {item.image_url && (
                            <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-full h-32 sm:h-36 object-cover rounded-lg mb-3"
                            />
                        )}
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            {item.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-2">
                            {item.code}
                        </p>
                        <p className="text-base sm:text-lg font-bold text-primary mb-3">
                            ₱{Number(item.price).toFixed(2)}
                        </p>
                        {!inStock && (
                            <p className="text-xs sm:text-sm text-red-600 dark:text-red-400 mb-2">Out of Stock</p>
                        )}
                        <button
                            onClick={() => handleAddToCart(item)}
                            disabled={!inStock}
                            className="w-full bg-primary text-white py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            Add to Cart
                        </button>
                    </div>
                ))}
            </div>

            {itemsWithStock.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-12">
                    No items available in this category.
                </p>
            )}

            {/* Quantity modal – responsive */}
            {showModal && selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)}>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-4 sm:p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4">Add {selectedItem.name}</h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quantity</label>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-10 h-10 bg-red-500 text-white rounded hover:bg-red-600"
                                >
                                    -
                                </button>
                                <span className="w-12 text-center text-lg text-gray-900 dark:text-white">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-10 h-10 bg-green-500 text-white rounded hover:bg-green-600"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button onClick={() => setShowModal(false)} className="w-full sm:flex-1 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">Cancel</button>
                            <button onClick={confirmAddToCart} className="w-full sm:flex-1 py-2 bg-primary text-white rounded hover:bg-primary-dark">Add to Cart</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}