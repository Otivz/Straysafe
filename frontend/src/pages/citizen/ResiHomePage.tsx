import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button';

const ResiHomePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('resident_user') || sessionStorage.getItem('resident_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            // Mock user for design testing if none found
            setUser({ name: 'StraySafe Member', email: 'resident@example.com' });
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('resident_user');
        sessionStorage.removeItem('resident_user');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-[#FAFAF9] font-sans">
            {/* Header / Navbar */}
            <nav className="bg-white border-b border-gray-100 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
                <div className="flex items-center space-x-3">
                    <img src="/SSLOGO.png" alt="Logo" className="h-10 w-auto" />
                    <span className="text-xl font-black tracking-tighter text-[#1a1208] uppercase">STRAYSAFE</span>
                </div>
                <div className="flex items-center space-x-6">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-black text-[#1a1208] leading-none">{user?.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Verified Resident</p>
                    </div>
                    <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>
            </nav>

            <main className="max-w-6xl mx-auto p-8">
                {/* Hero Section */}
                <div className="bg-[#F97316] rounded-[40px] p-12 text-white relative overflow-hidden shadow-2xl mb-12">
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <img src="/SSLOGO.png" alt="" className="w-full h-full object-cover scale-150 rotate-12" />
                    </div>
                    <div className="relative z-10">
                        <h1 className="text-5xl font-black mb-4 tracking-tight uppercase leading-none">Welcome Back,<br />{user?.name?.split(' ')[0]}!</h1>
                        <p className="text-orange-50 font-medium text-lg max-w-xl opacity-90 leading-relaxed italic">
                            "The greatness of a nation and its moral progress can be judged by the way its animals are treated."
                        </p>
                        <div className="mt-10 flex flex-wrap gap-4">
                            <Button variant="primary" className="bg-white text-[#F97316] hover:bg-orange-50 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl transition-all">
                                Report a Stray
                            </Button>
                            <Button variant="ghost" className="border-2 border-white text-white hover:bg-white/10 px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all">
                                View My Reports
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Recent Activity Card */}
                    <div className="md:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-black text-[#1a1208] uppercase tracking-tight">Recent Activity</h2>
                            <span className="text-xs font-bold text-[#F97316] bg-orange-50 px-3 py-1 rounded-full uppercase">Update: 2m ago</span>
                        </div>
                        <div className="space-y-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-orange-200 transition-colors group">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-[#F97316] shadow-sm font-bold">
                                            #{i}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 leading-none">Report #{1024 + i}</p>
                                            <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-bold">San Vicente Subdivision</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100">Rescued</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Stats / Info Card */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6">Your Impact</h3>
                            <div className="grid grid-cols-1 gap-6">
                                <div className="p-4 bg-orange-50 rounded-2xl">
                                    <p className="text-3xl font-black text-[#F97316]">12</p>
                                    <p className="text-xs font-bold text-orange-700/60 uppercase tracking-wider">Total Reports</p>
                                </div>
                                <div className="p-4 bg-blue-50 rounded-2xl">
                                    <p className="text-3xl font-black text-blue-600">8</p>
                                    <p className="text-xs font-bold text-blue-700/60 uppercase tracking-wider">Lives Saved</p>
                                </div>
                            </div>
                        </div>

                        {/* Local Announcements */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 overflow-hidden relative">
                             <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-full -mr-10 -mt-10 opacity-50"></div>
                             <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-6 relative z-10">Local News</h3>
                             <p className="text-sm font-bold text-gray-900 mb-2">Vaccination Drive</p>
                             <p className="text-xs text-gray-400 leading-relaxed mb-4">Anti-rabies drive happening at San Vicente Basketball Court this Sunday.</p>
                             <a href="#" className="text-xs font-black text-[#F97316] uppercase tracking-widest hover:underline transition-all">Learn More →</a>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ResiHomePage;
