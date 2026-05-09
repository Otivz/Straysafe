import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Button from '../../components/Button';
import ResiNavbar from '../../components/Navbars/ResiNavbar';
import ResiMobileNav from '../../components/Navbars/ResiMobileNav';

const ResiProfile = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState<any[]>([]);
    const [isNavbarMenuOpen, setIsNavbarMenuOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const userStr = localStorage.getItem('resident_user');
    const initialUser = userStr ? JSON.parse(userStr) : {
        name: 'Guest User',
        email: 'guest@straysafe.org',
        phone: '',
        address: '',
        user_id: 4, // Defaulting to 4 as per your current test case, but ideally should come from login
        created_at: new Date().toISOString()
    };

    const [userData, setUserData] = useState<any>(initialUser);
    const [editData, setEditData] = useState({ ...initialUser });

    useEffect(() => {
        fetchUserProfile();
        fetchUserReports();
    }, []);

    const fetchUserProfile = async () => {
        const storedUser = localStorage.getItem('resident_user');
        const userId = storedUser ? JSON.parse(storedUser).user_id : initialUser.user_id;
        
        try {
            const response = await axios.get(`http://localhost:8000/users/${userId}`);
            setUserData(response.data);
            setEditData(response.data);
            // Keep local storage in sync with DB
            localStorage.setItem('resident_user', JSON.stringify(response.data));
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    const fetchUserReports = async () => {
        const storedUser = localStorage.getItem('resident_user');
        const userId = storedUser ? JSON.parse(storedUser).user_id : initialUser.user_id;

        try {
            const response = await axios.get('http://localhost:8000/reports/');
            const userReports = response.data.filter((r: any) => r.user_id === userId);
            setReports(userReports);
        } catch (error) {
            console.error('Error fetching reports:', error);
        }
    };

    const handleDeleteReport = async (reportId: number) => {
        if (!window.confirm('Are you sure you want to delete this report?')) return;
        try {
            const response = await axios.delete(`http://localhost:8000/reports/${reportId}`);
            if (response.status === 200) {
                fetchUserReports();
            }
        } catch (error) {
            console.error('Error deleting report:', error);
            alert('Failed to delete report');
        }
    };
    
    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploadingPhoto(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            await axios.post(`http://localhost:8000/users/${userData.user_id}/profile-picture`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchUserProfile();
        } catch (error) {
            console.error('Error uploading photo:', error);
            alert('Failed to upload profile picture.');
        } finally {
            setIsUploadingPhoto(false);
        }
    };

    const handleSaveProfile = async () => {
        try {
            // Update in DB
            await axios.put(`http://localhost:8000/users/${userData.user_id}`, editData);
            // Refresh local data
            fetchUserProfile();
            setIsEditModalOpen(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile in database.');
        }
    };

    return (
        <div className="min-h-screen bg-[#F7F7F7] font-sans pb-20">
            <ResiNavbar onMenuToggle={(isOpen) => setIsNavbarMenuOpen(isOpen)} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36">
                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* Left Column: Profile Card */}
                    <div className="lg:w-[400px] shrink-0">
                        <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm text-center relative">
                            {/* Avatar */}
                            <div className="relative inline-block mb-4 mt-4 group">
                                <div className="w-36 h-36 rounded-full overflow-hidden border-2 border-white shadow-xl mx-auto relative">
                                    <img 
                                        src={userData.profile_picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`} 
                                        alt={userData.name} 
                                        className={`w-full h-full object-cover transition-all duration-300 ${isUploadingPhoto ? 'opacity-50 blur-sm' : 'group-hover:scale-110'}`}
                                    />
                                    
                                    {/* Upload Overlay */}
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploadingPhoto}
                                        className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Update Photo</span>
                                    </button>

                                    {isUploadingPhoto && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <svg className="animate-spin h-8 w-8 text-[#F97316]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handlePhotoUpload} 
                                    className="hidden" 
                                    accept="image/*" 
                                />
                            </div>

                            <div className="mb-6">
                                <h1 className="text-xl font-bold text-[#1a1208] flex items-center justify-center gap-2">
                                    {userData.name}
                                    {userData.is_verified && (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </h1>
                                <div className="flex items-center justify-center gap-2 mt-1">
                                    <p className="text-sm text-gray-500">@{userData.email.split('@')[0]}</p>
                                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${userData.status === 'Active' ? 'text-green-500' : 'text-gray-400'}`}>
                                        {userData.status || 'Active'}
                                    </span>
                                </div>
                            </div>

                            {/* Info List */}
                            <div className="space-y-4 pt-6 border-t border-gray-100 text-left">
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-3 text-gray-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span>Address</span>
                                    </div>
                                    <span className="font-bold text-gray-800 truncate max-w-[180px]">{userData.address || 'Not specified'}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-3 text-gray-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        <span>Joined</span>
                                    </div>
                                    <span className="font-bold text-gray-800">{new Date(userData.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-3 text-gray-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                        <span>Phone</span>
                                    </div>
                                    <span className="font-bold text-gray-800">{userData.phone || 'Not provided'}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-3 text-gray-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                        <span>Verified User</span>
                                    </div>
                                    <span className={`font-bold ${userData.is_verified ? 'text-blue-500' : 'text-gray-400'}`}>
                                        {userData.is_verified ? 'Yes' : 'No'}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-10 pt-6 border-t border-gray-100">
                                <Button 
                                    variant="primary" 
                                    fullWidth 
                                    className="py-3 gap-2"
                                    onClick={() => setIsEditModalOpen(true)}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit Information
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Active Gigs / Reports */}
                    <div className="flex-1">
                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
                            <div className="px-8 py-6 border-b border-gray-100">
                                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider relative inline-block">
                                    Active Incident Reports
                                    <div className="absolute -bottom-[25px] left-0 right-0 h-1 bg-[#F97316]"></div>
                                </h2>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {/* Create New Report Placeholder */}
                            <button 
                                onClick={() => navigate('/resident-home', { state: { openAddModal: true } })}
                                className="bg-white border-2 border-dashed border-gray-100 rounded-lg p-10 flex flex-col items-center justify-center gap-4 group hover:border-[#F97316] hover:bg-orange-50/30 transition-all min-h-[320px]"
                            >
                                <div className="w-16 h-16 rounded-full bg-[#F97316] flex items-center justify-center text-white shadow-lg shadow-orange-100 group-hover:scale-110 transition-transform">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <span className="text-sm font-black uppercase tracking-widest text-[#F97316]">Create a new Report</span>
                            </button>

                            {/* Report Cards */}
                            {reports.map((report) => (
                                <div key={report.report_id} className="bg-white border border-gray-200 rounded-lg overflow-hidden group shadow-sm hover:shadow-md transition-all flex flex-col">
                                    <div className="h-44 relative overflow-hidden bg-gray-100">
                                        <div className="absolute top-3 left-3 px-2 py-1 bg-black/50 backdrop-blur-md rounded text-[9px] font-black text-white uppercase tracking-widest z-10 flex items-center gap-1.5 shadow-sm">
                                            {report.visibility === 'Private' ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                            {report.visibility}
                                        </div>

                                        {/* 3-Dot Menu */}
                                        <div className="absolute top-3 right-3 z-20" ref={openMenuId === report.report_id ? menuRef : null}>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenMenuId(openMenuId === report.report_id ? null : report.report_id);
                                                }}
                                                className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/40 transition-all border border-white/30"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                                                </svg>
                                            </button>
                                            {openMenuId === report.report_id && (
                                                <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-2xl border border-gray-100 py-1 z-30 animate-in fade-in zoom-in-95 duration-200">
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate('/resident-home', { state: { editReport: report, isViewMode: true } });
                                                        }}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-[#F97316] hover:bg-orange-50 transition-colors"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                        View Details
                                                    </button>
                                                    <button 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteReport(report.report_id);
                                                            setOpenMenuId(null);
                                                        }}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors border-t border-gray-50"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                        Delete
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {report.media && report.media.length > 0 ? (
                                            <img 
                                                src={report.media[0].file_url} 
                                                alt="Report" 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4 flex-1 flex flex-col">
                                        <h3 className="text-sm font-medium text-gray-800 line-clamp-2 mb-4 hover:text-[#F97316] transition-colors cursor-pointer">
                                            I sighted {report.animal_count} {report.animal_type}(s) near {report.landmark || 'unknown location'}. Status is {report.status}.
                                        </h3>
                                        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                                            <div className="text-right ml-auto">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Priority</p>
                                                <p className="text-sm font-bold text-gray-800 uppercase">{report.priority_level}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
            <ResiMobileNav isNavbarMenuOpen={isNavbarMenuOpen} />

            {/* Edit Profile Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#1a1208]/60 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />
                    <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-8 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-bold text-[#1a1208] uppercase tracking-tight">Edit Profile</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Full Name</label>
                                <input 
                                    type="text" 
                                    className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 text-sm font-bold focus:outline-none focus:border-orange-200"
                                    value={editData.name}
                                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Email Address</label>
                                <input 
                                    type="email" 
                                    className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 text-sm font-bold focus:outline-none focus:border-orange-200"
                                    value={editData.email}
                                    onChange={(e) => setEditData({...editData, email: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Contact Number</label>
                                <input 
                                    type="text" 
                                    className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 text-sm font-bold focus:outline-none focus:border-orange-200"
                                    value={editData.phone}
                                    onChange={(e) => setEditData({...editData, phone: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Address</label>
                                <input 
                                    type="text" 
                                    className="w-full h-12 bg-gray-50 border border-gray-100 rounded-xl px-4 text-sm font-bold focus:outline-none focus:border-orange-200"
                                    value={editData.address}
                                    onChange={(e) => setEditData({...editData, address: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="mt-10">
                            <Button variant="primary" fullWidth className="py-4" onClick={handleSaveProfile}>
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResiProfile;
