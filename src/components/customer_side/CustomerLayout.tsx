// components/customer_side/CustomerLayout.tsx
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from "../common/Header.tsx";
import { NavSidebar } from "../common/nav_sidebar/NavSidebar.tsx";
import { CartProvider } from "../../contexts/CartContext.tsx";
import FloatingCartButton from "./FloatingCartButton.tsx";

export function CustomerLayout() {
    const location = useLocation();
    const hideCartButton = location.pathname === '/checkout';

    return (
        <CartProvider>
            <div className="flex">
                <NavSidebar />
                <main className="flex-1 flex flex-col min-h-screen ml-64">
                    <Header showBackButton onBack={() => window.history.back()} includeIcon={false} />
                    <div className="flex-1 bg-gray-50 dark:bg-gray-800">
                        <Outlet />
                    </div>
                </main>
            </div>
            {!hideCartButton && <FloatingCartButton />}
        </CartProvider>
    );
}