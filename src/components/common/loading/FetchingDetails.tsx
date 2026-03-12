import {LoadingSpinner} from "./LoadingSpinner.tsx";

export function FetchingDetails(){
    return (
        <div className="menu-list-container flex flex-col items-center justify-center">
            <LoadingSpinner size={40} />
            <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
                Fetching details...
            </p>
        </div>
    );
}