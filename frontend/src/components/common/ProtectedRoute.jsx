import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Loader from './Loader';

const ProtectedRoute = ({ children, roles = [], allowedRoles = [], requiredRole = null }) => {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) {
        return <Loader />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const effectiveRoles = [...roles, ...allowedRoles];
    if (requiredRole) {
        effectiveRoles.push(requiredRole);
    }

    if (effectiveRoles.length > 0 && !effectiveRoles.includes(user?.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;