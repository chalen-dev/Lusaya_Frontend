// src/utils/swalHelpers.ts
import Swal, {type SweetAlertIcon } from 'sweetalert2';

// --- Toast configuration (mixin) ---
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    showCloseButton: true,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
    },
});

/**
 * Show a confirmation dialog.
 * @param title - The title of the dialog.
 * @param text - The main message.
 * @param icon - Icon type (default: 'warning').
 * @param confirmButtonText - Text for the confirm button (default: 'Yes').
 * @returns Promise<boolean> - true if confirmed, false if cancelled/dismissed.
 */
export const showConfirmation = async (
    title: string,
    text: string,
    icon: SweetAlertIcon = 'warning',
    confirmButtonText: string = 'Yes'
): Promise<boolean> => {
    const result = await Swal.fire({
        title,
        text,
        icon,
        showCancelButton: true,
        confirmButtonText,
        showCloseButton: true,
    });
    return result.isConfirmed;
};

/**
 * Show a toast notification.
 * @param message - The message to display.
 * @param icon - Icon type (default: 'success').
 */
export const showToast = (
    message: string,
    icon: SweetAlertIcon = 'success',

): void => {
    Toast.fire({
        icon,
        title: message,
    });
};