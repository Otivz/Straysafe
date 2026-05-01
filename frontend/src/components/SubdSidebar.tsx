import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Button from './Button';

const SubdSidebar = () => {
    const [isOpen, setIsOpen] = useState(true);
    const location = useLocation();

    const menuItems = [
        {
            path: '/staff/dashboard', label: 'Dashboard Overview', icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
            )
        },
        {
            path: '/staff/incidents', label: 'Incident Reports', icon: (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
            )
        }
    ];

    return (
        <aside className={`${isOpen ? 'w-64' : 'w-20'} relative bg-white border-r border-gray-100 flex flex-col justify-between flex-shrink-0 transition-all duration-300 z-50 h-screen`}>

            {/* Toggle Button */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                variant="light"
                size="icon-sm"
                className="absolute -right-3 top-8 z-50 text-gray-400 w-7 h-7"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-300 ${!isOpen && 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </Button>

            <div className="overflow-hidden flex-1 flex flex-col">
                {/* Menu Title */}
                <div className="pt-10 pb-6 px-6 flex items-center h-[88px]">
                    {isOpen && (
                        <h2 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest animate-in fade-in duration-300">
                            OPERATIONS
                        </h2>
                    )}
                </div>


                {/* Navigation */}
                <nav className="space-y-1 flex-1">
                    {menuItems.map((item) => {
                        const isActive = location.pathname.includes(item.path);
                        return (
                            <div key={item.path} className="relative group overflow-hidden">
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#F97316] rounded-r-full"></div>
                                )}
                                <Link
                                    to={item.path}
                                    className={`flex items-center py-3 font-bold text-xs uppercase tracking-widest transition-colors ${isActive
                                        ? 'bg-orange-50 text-[#F97316]'
                                        : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'
                                        } ${isOpen ? 'px-8' : 'justify-center px-0'}`}
                                >
                                    <span className="shrink-0">{item.icon}</span>
                                    {isOpen && <span className="ml-4 whitespace-nowrap animate-in fade-in duration-300">{item.label}</span>}
                                </Link>
                            </div>
                        );
                    })}
                </nav>
            </div>

        </aside>
    );
};

export default SubdSidebar;
