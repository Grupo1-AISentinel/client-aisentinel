import { Navigate, useLocation } from 'react-router';
import { useAuthStore } from '../../../features/auth/stores/authStore.js';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/?redirect=${redirect}`} replace />;
  }
  return children;
};

export default ProtectedRoute;
