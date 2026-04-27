import { Routes, Route } from 'react-router-dom';
import AdminLogin from '../pages/Admin/AdminLogin';
import AdminDashboard from '../pages/Admin/AdminDashboard';
import AdminUserManagement from '../pages/Admin/AdminUserManagement';
import AdminAccountSettings from '../pages/Admin/AdminAccountSettings';
import AdminReport from '../pages/Admin/AdminReport';
import ProtectedRoute from '../components/ProtectedRoute';

import LandingPage from '../pages/citizen/LandingPage';
import ResidentsLogin from '../pages/citizen/ResidentsLogin';
import ResiHomePage from '../pages/citizen/ResiHomePage';


const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />


            {/* Protected Admin Routes */}
            <Route element={<ProtectedRoute />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUserManagement />} />
                <Route path="/admin/account-settings" element={<AdminAccountSettings />} />
                <Route path="/admin/incidents" element={<AdminReport />} />
            </Route>

            {/* Protected Barangay/Subdivision Routes */}


            {/* Landing Page Route */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<ResidentsLogin />} />
            <Route path="/resident-home" element={<ResiHomePage />} />


            {/* Catch-all Redirect to Login */}
            <Route path="*" element={<AdminLogin />} />
        </Routes>
    );
};

export default AppRoutes;