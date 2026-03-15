import { LoginForm } from './LoginForm';
import { APP_NAME } from '../../utils/constants';

export function LoginStaff() {
    return (
        <LoginForm
            headerTitle={`${APP_NAME} Staff`}
            allowedRoles={['admin']} // only admin allowed
            redirectPath="/dashboard"
            blockedMessage="Invalid staff credentials"
        />
    );
}