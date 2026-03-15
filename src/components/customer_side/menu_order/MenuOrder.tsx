import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useHeaderTitle } from "../../../contexts/HeaderTitleContext.tsx";
import api from "../../../services/api.ts";
import type { Category } from "../../menu/menuTypes.ts";
import {LoadingScreen} from "../../common/loading/LoadingScreen.tsx";

export default function MenuOrder() {
    const navigate = useNavigate();
    const { setTitle } = useHeaderTitle();

    useEffect(() => {
        setTitle('Menu');
    }, [setTitle]);

    const { data: categories = [], isLoading } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const response = await api.get<Category[]>('/categories');
            return response.data;
        },
    });

    const handleCategoryClick = (categoryId: number) => {
        navigate(`/menu/category/${categoryId}`);
    };

    if (isLoading) return <LoadingScreen />;

    return (
        <div className="container mx-auto p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-6">Categories</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {categories.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => handleCategoryClick(category.id)}
                        className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-200 dark:border-gray-700 text-left flex flex-col h-full"
                    >
                        <div className="w-full h-40 sm:h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden">
                            <img
                                src={category.image_url || '/placeholder-category.png'}
                                alt={category.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/placeholder-category.png';
                                }}
                            />
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                {category.name}
                            </h3>
                            {category.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                    {category.description}
                                </p>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {categories.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-12">
                    No categories available.
                </p>
            )}
        </div>
    );
}