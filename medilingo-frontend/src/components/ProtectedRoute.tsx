import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../hooks/useAuthStore';

/**
 * ProtectedRoute — wraps routes that require authentication.
 * Redirects to /login if no access token is present.
 * Saves the current location for post-login redirect.
 * Requirements: 6.1, 6.2, 6.3, 14.2
 */
export function ProtectedRoute() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const location = useLocation();

  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
