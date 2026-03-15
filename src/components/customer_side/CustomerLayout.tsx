import { Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { Header } from "../common/Header.tsx";
import { NavSidebar } from "../common/nav_sidebar/NavSidebar.tsx";
import { CartProvider } from "../../contexts/CartContext.tsx";
import FloatingCartButton from "./FloatingCartButton.tsx";

export function CustomerLayout() {
    const location = useLocation();
    const hideCartButton = location.pathname === '/checkout';
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <CartProvider>
            <div className="flex min-h-screen">
                {/* Mobile sidebar backdrop */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar - hidden on mobile by default, slides in when open */}
                <div
                    className={`
                        fixed lg:static inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out
                        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    `}
                >
                    <NavSidebar />
                </div>

                <main className="flex-1 flex flex-col min-h-screen">
                    <Header
                        showBackButton
                        onBack={() => window.history.back()}
                        includeIcon={false}
                        showMenuButton={true}
                        onMenuClick={() => setSidebarOpen(true)}
                    />
                    <div className="flex-1 bg-gray-50 dark:bg-gray-800">
                        <Outlet />
                    </div>
                </main>
            </div>
            {!hideCartButton && <FloatingCartButton />}
        </CartProvider>
    );
}