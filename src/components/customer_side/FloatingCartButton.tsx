import { useState } from 'react';
import {useCart} from "../../contexts/CartContext.tsx";
import CartModal from "./CartModal.tsx";

export default function FloatingCartButton() {
    const { totalItems } = useCart();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-primary hover:bg-primary-hover text-white rounded-full p-4 shadow-lg transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                aria-label="View cart"
            >
                <i className="fas fa-shopping-cart text-xl" />
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {totalItems}
                </span>
            </button>

            <CartModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
}