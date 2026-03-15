import { LoginForm } from './LoginForm';
import { APP_NAME } from '../../utils/constants';

export function LoginStaff() {
    return (
        <LoginForm
            headerTitle={`${APP_NAME} Staff`}
            allowedRoles={['admin', 'cashier']}
            redirectPath={(role) => role === 'admin' ? '/dashboard' : '/ordersList'}
            blockedMessage="Invalid staff credentials"
        />
    );
}