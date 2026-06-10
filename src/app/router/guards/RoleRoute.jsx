import { Navigate } from 'react-router';
import { useAuthStore } from '../../../features/auth/stores/authStore.js';

const RoleRoute = ({ roles = [], children, fallback = '/unauthorized' }) => {
  const role = useAuthStore((s) => s.role);
  if (!roles.includes(role)) return <Navigate to={fallback} replace />;
  return children;
};

export default RoleRoute;
