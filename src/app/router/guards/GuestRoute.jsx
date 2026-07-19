import { Navigate } from 'react-router';
import { useAuthStore } from '../../../features/auth/stores/authStore.js';

const GuestRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return children;
};

export default GuestRoute;
