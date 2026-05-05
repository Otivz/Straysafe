import { Routes, Route } from 'react-router-dom';
import AdminLogin from '../pages/Admin/AdminLogin';
import AdminDashboard from '../pages/Admin/AdminDashboard';
import AdminUserManagement from '../pages/Admin/AdminUserManagement';
import AdminAccountSettings from '../pages/Admin/AdminAccountSettings';
import AdminReport from '../pages/Admin/AdminReport';
import AdminHeatMap from '../pages/Admin/AdminHeatMap';
import AdminLogs from '../pages/Admin/AdminLogs';
import ProtectedRoute from '../components/ProtectedRoute';

import CommunityStaffLogin from '../pages/Subd_Leaders/CommunityStaffLogin';
import SubdDashboard from '../pages/Subd_Leaders/SubdDashboard';
import SubdReports from '../pages/Subd_Leaders/SubdReports';

import LandingPage from '../pages/citizen/LandingPage';
import ResidentsLogin from '../pages/citizen/ResidentsLogin';
import ResiHomePage from '../pages/citizen/ResiHomePage';
import BrgyDashboard from '../pages/Barangay_Staff/BrgyDashboard';
import BrgyRescueRequests from '../pages/Barangay_Staff/BrgyRescueRequests';


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
                <Route path="/admin/heatmap" element={<AdminHeatMap />} />
                <Route path="/admin/logs" element={<AdminLogs />} />
            </Route>

            {/* Protected Barangay/Subdivision Routes */}
            <Route path="/staff/login" element={<CommunityStaffLogin />} />
            <Route path="/staff/dashboard" element={<SubdDashboard />} />
            <Route path="/staff/incidents" element={<SubdReports />} />

            {/* Barangay Staff Routes */}
            <Route path="/brgy/dashboard" element={<BrgyDashboard />} />
            <Route path="/brgy/rescue-requests" element={<BrgyRescueRequests />} />


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