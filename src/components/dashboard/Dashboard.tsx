// components/dashboard/Dashboard.tsx
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { useHeaderTitle } from '../../contexts/HeaderTitleContext';
import api from '../../services/api';
import { DashboardCard } from "./DashboardCard";
import {
    type BestSellingItem,
    type CategorySalesItem,
    COLORS,
    type OrderVolumeItem,
    PRESETS,
    type SalesPeriodItem,
    type SummaryData
} from "./dashboardTypes";
import { LoadingScreen } from "../common/loading/LoadingScreen";
import { ChartCard } from "./ChartCard";

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export function Dashboard() {
    const { setTitle } = useHeaderTitle();
    const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({
        start: null,
        end: null,
    });
    const [activePreset, setActivePreset] = useState<string>('7d');

    useEffect(() => {
        setTitle('Dashboard');
    }, [setTitle]);

    // Helper to get date string for API (YYYY-MM-DD)
    const getDateParam = (date: Date | null) => (date ? date.toISOString().split('T')[0] : null);

    // Update date range based on preset
    useEffect(() => {
        const preset = PRESETS[activePreset as keyof typeof PRESETS];
        if (preset) {
            const end = new Date();
            const start = new Date();
            start.setDate(end.getDate() - preset.days);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setDateRange({ start: getDateParam(start), end: getDateParam(end) });
        }
    }, [activePreset]);

    // Build query params
    const params = new URLSearchParams();
    if (dateRange.start) params.append('start_date', dateRange.start);
    if (dateRange.end) params.append('end_date', dateRange.end);

    // Fetch all dashboard data
    const {
        data: summary,
        isLoading: summaryLoading,
        error: summaryError,
    } = useQuery<SummaryData>({
        queryKey: ['dashboard-summary', dateRange.start, dateRange.end],
        queryFn: async () => {
            const res = await api.get(`/dashboard/summary?${params}`);
            return res.data;
        },
    });

    const {
        data: salesByPeriod = [],
        isLoading: salesLoading,
    } = useQuery<SalesPeriodItem[]>({
        queryKey: ['dashboard-sales-by-period', dateRange.start, dateRange.end, 'day'],
        queryFn: async () => {
            const res = await api.get(`/dashboard/sales-by-period?${params}&group_by=day`);
            return res.data;
        },
    });

    const {
        data: bestSelling = [],
        isLoading: bestLoading,
    } = useQuery<BestSellingItem[]>({
        queryKey: ['dashboard-best-selling', dateRange.start, dateRange.end],
        queryFn: async () => {
            const res = await api.get(`/dashboard/best-selling-items?${params}&limit=5&sort_by=revenue`);
            return res.data;
        },
    });

    const {
        data: categorySales = [],
        isLoading: categoryLoading,
    } = useQuery<CategorySalesItem[]>({
        queryKey: ['dashboard-category-sales', dateRange.start, dateRange.end],
        queryFn: async () => {
            const res = await api.get(`/dashboard/sales-by-category?${params}`);
            return res.data;
        },
    });

    const {
        data: orderVolume = [],
        isLoading: volumeLoading,
    } = useQuery<OrderVolumeItem[]>({
        queryKey: ['dashboard-order-volume', dateRange.start, dateRange.end],
        queryFn: async () => {
            const res = await api.get(`/dashboard/order-volume?${params}`);
            return res.data;
        },
    });

    const isLoading = summaryLoading || salesLoading || bestLoading || categoryLoading || volumeLoading;

    if (isLoading) return <LoadingScreen />;
    if (summaryError) return <div className="p-4 text-red-600">Error loading dashboard data</div>;

    // Safe access with fallbacks
    const totalSales = summary?.total_sales ?? 0;
    const totalOrders = summary?.total_orders ?? 0;
    const avgOrderValue = summary?.avg_order_value ?? 0;

    // Chart data formatters
    const formatCurrency = (value: number) => `₱${value.toLocaleString()}`;

    return (
        <>
            <Helmet>
                <title>Dashboard</title>
            </Helmet>

            {/* Header */}
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Dashboard</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Overview of your platform</p>
                </div>

                {/* Date range presets */}
                <div className="flex gap-2">
                    {Object.entries(PRESETS).map(([key, { label }]) => (
                        <button
                            key={key}
                            onClick={() => setActivePreset(key)}
                            className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                activePreset === key
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <DashboardCard label="Total Sales" value={formatCurrency(totalSales)} />
                <DashboardCard label="Total Orders" value={totalOrders.toLocaleString()} />
                <DashboardCard label="Avg Order Value" value={formatCurrency(avgOrderValue)} />
            </div>

            {/* Charts grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar Chart: Daily Sales */}
                <ChartCard title="Daily Sales">
                    {salesByPeriod.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">No data for this period</p>
                    ) : (
                        <div className="h-[300px]">
                            <Bar
                                data={{
                                    labels: salesByPeriod.map(item => item.date),
                                    datasets: [
                                        {
                                            label: 'Sales',
                                            data: salesByPeriod.map(item => item.total_sales),
                                            backgroundColor: '#3B82F6',
                                        },
                                    ],
                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        tooltip: {
                                            callbacks: {
                                                label: (context) => formatCurrency(context.raw as number),
                                            },
                                        },
                                    },
                                }}
                            />
                        </div>
                    )}
                </ChartCard>

                {/* Line Chart: Order Volume Trend */}
                <ChartCard title="Order Volume (Daily)">
                    {orderVolume.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">No data for this period</p>
                    ) : (
                        <div className="h-[300px]">
                            <Line
                                data={{
                                    labels: orderVolume.map(item => item.date),
                                    datasets: [
                                        {
                                            label: 'Orders',
                                            data: orderVolume.map(item => item.order_count),
                                            borderColor: '#10B981',
                                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                            tension: 0.1,
                                            fill: true,
                                        },
                                    ],
                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        tooltip: {
                                            callbacks: {
                                                label: (context) => context.raw?.toLocaleString() ?? '',
                                            },
                                        },
                                    },
                                }}
                            />
                        </div>
                    )}
                </ChartCard>

                {/* Pie Chart: Sales by Category */}
                <ChartCard title="Sales by Category">
                    {categorySales.length === 0 ? (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">No data for this period</p>
                    ) : (
                        <div className="h-[300px] flex items-center justify-center">
                            <Pie
                                data={{
                                    labels: categorySales.map(item => item.name),
                                    datasets: [
                                        {
                                            data: categorySales.map(item => item.total_sales),
                                            backgroundColor: COLORS.slice(0, categorySales.length),
                                            borderColor: 'transparent',
                                        },
                                    ],
                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,
                                    plugins: {
                                        legend: {
                                            display: true,
                                            position: 'right',
                                        },
                                        tooltip: {
                                            callbacks: {
                                                label: (context) => {
                                                    const value = context.raw as number;
                                                    return `${context.label}: ${formatCurrency(value)}`;
                                                },
                                            },
                                        },
                                    },
                                }}
                            />
                        </div>
                    )}
                </ChartCard>

                {/* Best Selling Items Table */}
                <ChartCard title="Top 5 Best Sellers">
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Item</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Quantity</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Revenue</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {bestSelling.map((item) => (
                                <tr key={item.id}>
                                    <td className="px-4 py-2 text-gray-900 dark:text-white">{item.name}</td>
                                    <td className="px-4 py-2 text-right text-gray-600 dark:text-gray-400">{item.total_quantity}</td>
                                    <td className="px-4 py-2 text-right font-medium text-gray-900 dark:text-white">
                                        {formatCurrency(item.total_revenue)}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </ChartCard>
            </div>
        </>
    );
}
