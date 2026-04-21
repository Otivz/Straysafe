import { useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/AdminNavbar';
import Button from '../../components/Button';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'Admin' | 'Staff' | 'Volunteer';
    status: 'Active' | 'Inactive';
}

const AdminUserManagement = () => {
    const [users, setUsers] = useState<User[]>([
        { id: '1', name: 'John Doe', email: 'john@stray-safe.org', role: 'Admin', status: 'Active' },
        { id: '2', name: 'Jane Smith', email: 'jane@stray-safe.org', role: 'Staff', status: 'Active' },
        { id: '3', name: 'Mike Ross', email: 'mike@stray-safe.org', role: 'Volunteer', status: 'Inactive' },
    ]);

    const [searchTerm, setSearchTerm] = useState('');

    const toggleStatus = (id: string) => {
        setUsers(users.map(user => 
            user.id === id 
                ? { ...user, status: user.status === 'Active' ? 'Inactive' : 'Active' } 
                : user
        ));
    };

    return (
        <div className="flex h-screen bg-[#F8FAFC]">
            <AdminSidebar />
            
            <div className="flex-1 flex flex-col overflow-hidden">
                <AdminNavbar />

                <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                            <p className="text-gray-500 text-sm mt-1">Manage platform administrators, staff, and volunteers.</p>
                        </div>
                        <Button variant="primary" className="flex items-center space-x-2 px-6">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            <span>Add New User</span>
                        </Button>
                    </div>

                    {/* Stats/Filters Bar */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </span>
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#F97316] outline-none transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <select className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-[#F97316]">
                                <option>All Roles</option>
                                <option>Admin</option>
                                <option>Staff</option>
                                <option>Volunteer</option>
                            </select>
                            <select className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-[#F97316]">
                                <option>All Status</option>
                                <option>Active</option>
                                <option>Inactive</option>
                            </select>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-bottom border-gray-100">
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">User Details</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Role</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase())).map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-full bg-[#FFF7ED] flex items-center justify-center text-[#F97316] font-bold">
                                                    {user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${
                                                user.role === 'Admin' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                                user.role === 'Staff' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                'bg-amber-50 text-amber-600 border-amber-100'
                                            }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <div className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                <span className={`text-xs font-medium ${user.status === 'Active' ? 'text-green-700' : 'text-gray-500'}`}>{user.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button className="p-2 text-gray-400 hover:text-[#F97316] transition-colors rounded-lg hover:bg-orange-50" title="Edit User">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                    </svg>
                                                </button>
                                                <button 
                                                    onClick={() => toggleStatus(user.id)}
                                                    className={`p-2 transition-colors rounded-lg ${user.status === 'Active' ? 'text-gray-400 hover:text-red-500 hover:bg-red-50' : 'text-gray-400 hover:text-green-500 hover:bg-green-50'}`}
                                                    title={user.status === 'Active' ? 'Deactivate User' : 'Activate User'}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {/* Footer / Pagination */}
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                            <p className="text-xs text-gray-500">Showing {users.length} users</p>
                            <div className="flex space-x-2">
                                <button className="px-3 py-1 border border-gray-200 rounded text-xs font-medium text-gray-400 hover:bg-white transition-colors cursor-not-allowed">Previous</button>
                                <button className="px-3 py-1 border border-[#F97316] bg-[#F97316]/10 rounded text-xs font-bold text-[#F97316]">1</button>
                                <button className="px-3 py-1 border border-gray-200 rounded text-xs font-medium text-gray-500 hover:bg-white transition-colors">Next</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    </div>
    );
};

export default AdminUserManagement;