import {useNavigate} from "react-router-dom";
import {useCart} from "../../contexts/CartContext.tsx";

interface CartModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CartModal({ isOpen, onClose }: CartModalProps) {
    const { items, updateQuantity, removeItem, totalAmount } = useCart();
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleCheckout = () => {
        onClose();
        navigate('/checkout');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Your Cart</h2>
                    <button onClick={onClose} className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        <i className="fas fa-times text-xl" />
                    </button>
                </div>

                {/* Cart items */}
                <div className="overflow-y-auto p-4 max-h-96">
                    {items.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">Your cart is empty</p>
                    ) : (
                        <div className="space-y-4">
                            {items.map(item => (
                                <div key={item.menuItemId} className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 gap-3">
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900 dark:text-white">{item.name}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">₱{item.price.toFixed(2)} each</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                                            className="w-8 h-8 bg-red-500 text-white rounded hover:bg-red-600"
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
                                        <button
                                            onClick={() => removeItem(item.menuItemId)}
                                            className="ml-2 text-red-500 hover:text-red-700"
                                        >
                                            <i className="fas fa-trash" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4">
                    <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white mb-4">
                        <span>Total:</span>
                        <span>₱{totalAmount.toFixed(2)}</span>
                    </div>
                    <button
                        onClick={handleCheckout}
                        disabled={items.length === 0}
                        className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50"
                    >
                        Proceed to Checkout
                    </button>
                </div>
            </div>
        </div>
    );
}