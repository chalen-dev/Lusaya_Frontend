import { LoginForm } from './LoginForm';
import { APP_NAME } from '../../utils/constants';

export function LoginCustomer() {
    return (
        <LoginForm
            headerTitle={APP_NAME}
            allowedRoles={['customer', 'cashier']} // now both can log in
            redirectPath={(role) => role === 'customer' ? '/menuOrder' : '/ordersList'}
            blockedMessage="Invalid credentials"
        />
    );
}