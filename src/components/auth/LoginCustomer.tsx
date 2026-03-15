import { LoginForm } from './LoginForm';
import { APP_NAME } from '../../utils/constants';

export function LoginCustomer() {
    return (
        <LoginForm
            headerTitle={APP_NAME}
            allowedRoles={['customer']}
            redirectPath="/order"
            blockedMessage="Invalid customer credentials"
        />
    );
}