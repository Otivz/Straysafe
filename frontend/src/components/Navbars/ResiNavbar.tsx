import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Button from '../Button';

interface ResiNavbarProps {
    onMenuToggle?: (isOpen: boolean) => void;
}

const ResiNavbar = ({ onMenuToggle }: ResiNavbarProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const userStr = localStorage.getItem('resident_user');
    const initialUser = userStr ? JSON.parse(userStr) : null;
    const [user, setUser] = useState(initialUser);

    useEffect(() => {
        const fetchLatestProfile = async () => {
            if (!initialUser?.user_id) return;
            try {
                const res = await axios.get(`http://localhost:8000/users/${initialUser.user_id}`);
                localStorage.setItem('resident_user', JSON.stringify(res.data));
                setUser(res.data);
            } catch (err) {
                console.error("Failed to refresh profile", err);
            }
        };
        fetchLatestProfile();
    }, [initialUser?.user_id]);

    const profilePic = user?.profile_picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`;

    const toggleMenu = () => {
        const newState = !isMenuOpen;
        setIsMenuOpen(newState);
        if (onMenuToggle) onMenuToggle(newState);
    };

    const handleLogout = () => {
        localStorage.removeItem('resident_user');
        sessionStorage.removeItem('resident_user');
        navigate('/login');
    };



    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-md border-b border-gray-100 font-sans tracking-tight h-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
                    <div className="flex justify-between items-center h-full">

                        {/* LOGO */}
                        <Link to="/resident-home" className="flex items-center gap-3 group">
                            <img
                                src="/SSLOGO.png"
                                alt="StraySafe Logo"
                                className="h-10 w-auto group-hover:scale-110 transition-transform"
                            />
                            <span className="font-black text-2xl tracking-tighter text-[#1a1208] uppercase">STRAYSAFE</span>
                        </Link>

                        {/* DESKTOP NAV REMOVED */}
                        <div className="hidden md:flex items-center gap-6">
                            {/* Notification Bell */}
                            <button className="relative p-2 text-[#4a3b28] hover:bg-gray-50 rounded-xl transition-all group">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#EF4444] border-2 border-white rounded-full"></span>
                            </button>

                            {/* Only Profile Dropdown remains on desktop */}
                            
                            {/* PROFILE DROPDOWN */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="relative group focus:outline-none"
                                >
                                    {/* Avatar Container */}
                                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md group-hover:border-[#F97316] transition-all duration-300">
                                        <img
                                            src={profilePic}
                                            alt="User"
                                            className="w-full h-full object-cover bg-gray-100"
                                        />
                                    </div>

                                    {/* Overlapping Arrow Button */}
                                    <div className={`absolute bottom-0 right-0 w-6 h-6 rounded-full bg-[#1a1208] border-2 border-white flex items-center justify-center text-white shadow-lg transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 bg-[#F97316]' : 'group-hover:scale-110'}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </button>

                                {/* DROPDOWN MENU */}
                                {isDropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)} />
                                        <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-20 animate-in fade-in zoom-in-95 duration-200">

                                            <Link to="/resident/profile" className="flex items-center px-6 py-3 text-xs font-bold text-[#4a3b28] hover:bg-[#FAFAF9] hover:text-[#F97316] transition-all">
                                                View Profile
                                            </Link>
                                            <Link to="/resident/pets" className="flex items-center px-6 py-3 text-xs font-bold text-[#4a3b28] hover:bg-[#FAFAF9] hover:text-[#F97316] transition-all">
                                                My Pets
                                            </Link>
                                            <Link to="/resident/settings" className="flex items-center px-6 py-3 text-xs font-bold text-[#4a3b28] hover:bg-[#FAFAF9] hover:text-[#F97316] transition-all">
                                                Preferences
                                            </Link>
                                            <div className="mx-4 my-2 h-[1px] bg-gray-50" />
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center px-6 py-3 text-xs font-black text-[#EF4444] hover:bg-red-50 transition-all uppercase tracking-widest"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* MOBILE ACTIONS */}
                        <div className="md:hidden flex items-center gap-2">
                            {/* Notification Bell */}
                            <button className="p-2.5 text-[#4a3b28] hover:text-[#F97316] transition-all relative flex items-center justify-center active:scale-95">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#EF4444] border-2 border-white rounded-full shadow-sm"></span>
                            </button>

                            {/* Menu Toggle */}
                            <button
                                onClick={toggleMenu}
                                className="p-3 text-[#1a1208] hover:bg-gray-50 rounded-2xl transition-all flex items-center justify-center border border-gray-50 shadow-sm active:scale-95"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* MOBILE MENU (DASHBOARD LAYOUT) */}
            <div className={`md:hidden fixed inset-0 z-[200] bg-white transition-all duration-500 ease-in-out transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="h-full flex flex-col overflow-y-auto">

                    {/* Header */}
                    <div className="px-8 pt-8 pb-6 flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-black tracking-tighter text-[#1a1208] uppercase leading-none">STRAY-SAFE</h2>
                            <p className="text-[10px] font-black text-[#F97316] uppercase tracking-widest mt-2">Compassionate Guardian</p>
                        </div>
                        <button onClick={() => { setIsMenuOpen(false); if (onMenuToggle) onMenuToggle(false); }} className="p-2 text-gray-400 hover:text-[#1a1208]">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="px-6 space-y-8 pb-12">
                        {/* User Card */}
                        <div className="bg-[#FAFAF9] rounded-[2.5rem] p-6 flex items-center justify-between border border-gray-50 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="relative w-16 h-16 rounded-3xl overflow-hidden border-2 border-white shadow-md">
                                    <img src={profilePic} alt="User" className="w-full h-full object-cover bg-gray-100" />
                                    <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-[#1a1208] leading-tight">{user?.name || 'User Name'}</h3>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div>
                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-6 px-2">Account Actions</p>
                            <div className="space-y-4">
                                <Link to="/resident/profile" onClick={() => { setIsMenuOpen(false); if (onMenuToggle) onMenuToggle(false); }} className="flex items-center justify-between p-4 group">
                                    <div className="flex items-center gap-4 text-[#4a3b28]">
                                        <div className="p-3 bg-gray-50 rounded-2xl group-hover:bg-orange-50 group-hover:text-[#F97316] transition-all">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <span className="text-sm font-black text-[#4a3b28] uppercase tracking-widest">Settings</span>
                                    </div>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                                
                                <button onClick={handleLogout} className="w-full flex items-center justify-between p-4 group">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-red-50 rounded-2xl group-hover:bg-[#EF4444] text-[#EF4444] group-hover:text-white transition-all">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                        </div>
                                        <span className="text-sm font-black text-[#EF4444] uppercase tracking-widest">Logout</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ResiNavbar;
