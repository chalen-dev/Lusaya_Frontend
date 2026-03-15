import './App.css'
import {BrowserRouter, Route, Routes} from "react-router-dom";
import {LoginCustomer} from "./components/auth/LoginCustomer.tsx";
import {Dashboard} from "./components/dashboard/Dashboard.tsx";
import ProtectedRoute from "./components/auth/ProtectedRoute.tsx";
import {AuthLayout} from "./components/AuthLayout.tsx";
import {GuestLayout} from "./components/auth/GuestLayout.tsx";
import {Unauthorized} from "./components/common/errors/Unauthorized.tsx";
import {RoleBasedRoute} from "./components/auth/RoleBasedRoute.tsx";
import POSInterface from "./components/pos/POSInterface.tsx";
import {OrdersList} from "./components/orders/OrdersList.tsx";
import {MenuList} from "./components/menu/MenuList.tsx";
import {InventoryList} from "./components/inventory/InventoryList.tsx";
import {LoginStaff} from "./components/auth/LoginStaff.tsx";

import {CustomerLayout} from "./components/customer_side/CustomerLayout.tsx";
import FoodChoices from "./components/customer_side/menu_order/FoodChoices.tsx";
import MenuOrder from "./components/customer_side/menu_order/MenuOrder.tsx";
import Checkout from "./components/customer_side/menu_order/Checkout.tsx";
import MyOrders from "./components/customer_side/my_orders/MyOrders.tsx";
import {UserManagement} from "./components/admin/UserManagement.tsx";


function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<GuestLayout />}>
                    <Route path="/" element={<LoginCustomer />} />
                    <Route path="/loginStaff" element={<LoginStaff />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />
                    <Route path="*" element={<LoginCustomer />}/>
                </Route>

                <Route element={<ProtectedRoute />}>
                    <Route element={<AuthLayout />}>

                        <Route element={<RoleBasedRoute allowedRoles={'admin'} />}>
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/userManagement" element={<UserManagement />} />
                        </Route>

                        <Route element={<RoleBasedRoute allowedRoles={['admin', 'cashier']} />}>
                            <Route path="/menuList" element={<MenuList />} />
                            <Route path="/inventory" element={<InventoryList />} />
                            <Route path="/ordersList" element={<OrdersList />} />
                        </Route>
                    </Route>
                    <Route element={<CustomerLayout />}>
                        <Route element={<RoleBasedRoute allowedRoles="customer" />}>
                            <Route path="/menuOrder" element={<MenuOrder />} />
                            <Route path="/menu/category/:categoryId" element={<FoodChoices />} />
                            <Route path="/checkout" element={<Checkout />} />
                            <Route path="/myOrders" element={<MyOrders />} />
                        </Route>
                    </Route>
                    <Route element={<RoleBasedRoute allowedRoles="cashier" />}>
                        <Route path="/pos" element={<POSInterface />} />
                    </Route>

                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App
