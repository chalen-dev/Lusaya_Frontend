import {LoadingSpinner} from "./LoadingSpinner.tsx";
import {Helmet} from "react-helmet-async";

export function LoadingScreen() {
    return (
        <>
            <Helmet>
                <title>Loading...</title>
            </Helmet>
            <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
                <LoadingSpinner size={60} />
                <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
                    Loading...
                </p>
            </div>
        </>
    );
}