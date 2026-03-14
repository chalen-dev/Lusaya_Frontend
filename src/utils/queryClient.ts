import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes – data is fresh for 5 minutes
            gcTime: 1000 * 60 * 10,   // 10 minutes – unused data is garbage collected after 10 minutes
        },
    },
});