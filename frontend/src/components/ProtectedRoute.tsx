import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    // Check if user is authenticated by looking for admin_user in storage
    const isAuthenticated = 
        localStorage.getItem('admin_user') !== null || 
        sessionStorage.getItem('admin_user') !== null;

    if (!isAuthenticated) {
        // Redirect to login if not authenticated
        return <Navigate to="/admin/login" replace />;
    }

    // If authenticated, render the child components (the protected pages)
    return <Outlet />;
};

export default ProtectedRoute;
