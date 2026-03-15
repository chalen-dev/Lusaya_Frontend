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

interface CartProps {
    cart: CartItem[];
    onUpdateQuantity: (inventoryId: number, newQuantity: number) => void;
    onRemove: (inventoryId: number) => void;
}

export const Cart: React.FC<CartProps> = ({ cart, onUpdateQuantity, onRemove }) => {
    return (
        <div className="space-y-2">
            {cart.map((item) => (
                <div key={item.inventoryId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-700/30">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                                {item.menuItem.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                ₱{item.unitPrice.toFixed(2)} each
                            </div>
                        </div>
                        <button
                            onClick={() => onRemove(item.inventoryId)}
                            className="text-red-500 hover:text-red-700"
                        >
                            <i className="fas fa-trash" />
                        </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => onUpdateQuantity(item.inventoryId, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className="w-6 h-6 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                            >
                                -
                            </button>
                            <span className="w-8 text-center text-gray-900 dark:text-white">
                                {item.quantity}
                            </span>
                            <button
                                onClick={() => onUpdateQuantity(item.inventoryId, item.quantity + 1)}
                                className="w-6 h-6 bg-green-500 text-white rounded hover:bg-green-600"
                            >
                                +
                            </button>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white">
                            ₱{(item.unitPrice * item.quantity).toFixed(2)}
                        </span>
                    </div>
                </div>
            ))}
            {cart.length === 0 && (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    Cart is empty
                </p>
            )}
        </div>
    );
};