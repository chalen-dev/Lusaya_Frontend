interface DashboardCardProps {
    label: string;
    value: string;
    className?: string;
}

export function DashboardCard({ label, value, className = '' }: DashboardCardProps) {
    return (
        <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow ${className}`}>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                {label}
            </h3>
            <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                {value}
            </p>
        </div>
    );
}