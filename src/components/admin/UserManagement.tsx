// pages/admin/UserManagement.tsx
import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useHeaderTitle } from '../../contexts/HeaderTitleContext';
import api from '../../services/api';
import { showToast } from '../../utils/swalHelpers';
import { LoadingScreen } from '../common/loading/LoadingScreen';
import type { User } from '../auth/authTypes';

export function UserManagement() {
    const { setTitle } = useHeaderTitle();
    const queryClient = useQueryClient();

    useEffect(() => {
        setTitle('User Management');
    }, [setTitle]);

    // Fetch users (exclude admins)
    const { data: users = [], isLoading, error } = useQuery<User[]>({
        queryKey: ['users'],
        queryFn: async () => {
            const res = await api.get('/users');
            // show only cashiers and customers
            return res.data.filter((u: User) => u.role !== 'admin');
        },
    });

    const blacklistMutation = useMutation({
        mutationFn: ({ id, is_blacklisted }: { id: number; is_blacklisted: boolean }) =>
            api.patch(`/users/${id}/blacklist`, { is_blacklisted }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            showToast('User status updated', 'success');
        },
        onError: () => showToast('Failed to update user', 'error'),
    });

    const toggleBlacklist = (user: User) => {
        blacklistMutation.mutate({ id: user.id, is_blacklisted: !user.is_blacklisted });
    };

    if (isLoading) return <LoadingScreen />;
    if (error) return <div className="p-4 text-red-600">Error loading users</div>;

    return (
        <div className="container mx-auto p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">User Management</h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Action</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{user.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                        user.role === 'cashier'
                                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                    }`}>
                                        {user.role}
                                    </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                        user.is_blacklisted
                                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                            : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                    }`}>
                                        {user.is_blacklisted ? 'Blacklisted' : 'Active'}
                                    </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                <button
                                    onClick={() => toggleBlacklist(user)}
                                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                                        user.is_blacklisted
                                            ? 'bg-green-500 hover:bg-green-600 text-white'
                                            : 'bg-red-500 hover:bg-red-600 text-white'
                                    }`}
                                >
                                    {user.is_blacklisted ? 'Unblacklist' : 'Blacklist'}
                                </button>
                            </td>
                        </tr>
                    ))}
                    {users.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                                No users found.
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}