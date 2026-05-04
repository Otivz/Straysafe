import { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSidebar from '../../components/AdminSidebar';
import AdminNavbar from '../../components/Navbars/AdminNavbar';
import MapComponent from '../../components/MapComponent';

import SummaryCard from '../../components/Cards/SummaryCard';

interface HotspotArea {
    name: string;
    count: number;
    risk: 'High' | 'Medium' | 'Low';
    trend: 'up' | 'down' | 'stable';
}

const AdminHeatMap = () => {
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeFilter, setTimeFilter] = useState('7d');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [showSummary, setShowSummary] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // Mock Hotspot Data
    const hotspots: HotspotArea[] = [
        { name: 'San Vicente Core', count: 42, risk: 'High', trend: 'up' },
        { name: 'Clubhouse Perimeter', count: 28, risk: 'Medium', trend: 'down' },
        { name: 'North Entrance', count: 15, risk: 'Low', trend: 'stable' },
        { name: 'Park Street', count: 12, risk: 'Low', trend: 'up' },
    ];

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8000/reports');
            setReports(response.data);
        } catch (error) {
            console.error('Error fetching reports for heatmap:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    return (
        <div className="flex h-screen bg-[#0F172A] text-slate-200">
            <AdminSidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <AdminNavbar />

                <main className="flex-1 relative overflow-hidden flex flex-col">
                    {/* Map Overlay Stats & Control Dropdowns */}
                    <div className="absolute top-6 right-6 z-[9999] flex flex-col items-end gap-4">
                        <div className="flex gap-4">
                            {/* Stats Cards */}
                            <SummaryCard 
                                label="Total Monitored" 
                                value={reports.length} 
                                className="hidden md:flex"
                            />
                            <SummaryCard 
                                label="Active Clusters" 
                                value={12} 
                                accentColor="#FBBF24"
                                className="hidden md:flex"
                            />

                            {/* Filters/Monitoring Dropdown Button */}
                            <button 
                                onClick={() => {
                                    setShowFilters(!showFilters);
                                    setShowSummary(false);
                                }}
                                className={`bg-[#1B4340] border-t-2 p-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex flex-col items-center justify-center transition-all min-w-[110px] hover:scale-[1.05] active:scale-[0.95] ${showFilters ? 'border-[#F97316] ring-2 ring-[#FBBF24]/10' : 'border-teal-900/50 hover:border-teal-700'}`}
                            >
                                <span className="block text-[10px] font-black text-teal-100/60 uppercase tracking-[0.2em] mb-1.5">Monitoring</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-[#FBBF24] transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                </svg>
                            </button>

                            {/* Summary Dropdown Button */}
                            <button 
                                onClick={() => {
                                    setShowSummary(!showSummary);
                                    setShowFilters(false);
                                }}
                                className={`bg-[#1B4340] border-t-2 p-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.4)] flex flex-col items-center justify-center transition-all min-w-[110px] hover:scale-[1.05] active:scale-[0.95] ${showSummary ? 'border-[#F97316] ring-2 ring-[#FBBF24]/10' : 'border-teal-900/50 hover:border-teal-700'}`}
                            >
                                <span className="block text-[10px] font-black text-teal-100/60 uppercase tracking-[0.2em] mb-1.5">Summary</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 text-[#FBBF24] transition-transform ${showSummary ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                        </div>

                        {/* Monitoring & Filters Dropdown Content */}
                        {showFilters && (
                            <div className="w-80 bg-[#1B4340]/95 backdrop-blur-xl border border-teal-800/50 rounded-3xl shadow-3xl p-6 space-y-6 animate-in slide-in-from-top-4 duration-300">
                                <div className="mb-4">
                                    <h1 className="text-xl font-black tracking-tight text-white uppercase">Incident Heatmap</h1>
                                    <p className="text-xs text-teal-100/60 mt-1 uppercase tracking-widest font-bold">Stray Density Monitoring</p>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <label className="text-[10px] font-black text-teal-100/40 uppercase tracking-widest mb-3 block">Time Period</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {['24h', '7d', '30d'].map((t) => (
                                                <button
                                                    key={t}
                                                    onClick={() => setTimeFilter(t)}
                                                    className={`py-2 rounded-xl text-[10px] font-black transition-all border ${timeFilter === t 
                                                        ? 'bg-[#F97316] border-[#F97316] text-white shadow-lg shadow-orange-500/20' 
                                                        : 'bg-teal-900/40 border-teal-800/50 text-teal-100/50 hover:border-teal-600'}`}
                                                >
                                                    {t.toUpperCase()}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-teal-100/40 uppercase tracking-widest mb-3 block">Category</label>
                                        <select 
                                            className="w-full bg-teal-900/40 border border-teal-800/50 rounded-xl px-4 py-2.5 text-xs font-bold text-teal-50 text-white focus:outline-none focus:border-[#F97316] transition-all appearance-none"
                                            value={categoryFilter}
                                            onChange={(e) => setCategoryFilter(e.target.value)}
                                        >
                                            <option value="all">All Categories</option>
                                            <option value="1">Injured Animal</option>
                                            <option value="2">Aggressive Stray</option>
                                            <option value="3">Possible Rabies</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Summary Dropdown Content */}
                        {showSummary && (
                            <div className="w-80 bg-[#1B4340]/95 backdrop-blur-xl border border-teal-800/50 rounded-3xl shadow-3xl p-6 space-y-6 animate-in slide-in-from-top-4 duration-300">
                                <div>
                                    <label className="text-[11px] font-black text-[#FBBF24] uppercase tracking-widest mb-4 block">Hotspot Rankings</label>
                                    <div className="space-y-3">
                                        {hotspots.map((spot, idx) => (
                                            <div key={idx} className="bg-teal-900/30 border border-teal-800/30 p-4 rounded-2xl hover:border-teal-700 transition-all group">
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="text-xs font-black text-teal-50 group-hover:text-white">{spot.name}</span>
                                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                                                        spot.risk === 'High' ? 'bg-red-500/20 text-red-400' :
                                                        spot.risk === 'Medium' ? 'bg-[#F97316]/20 text-[#F97316]' :
                                                        'bg-teal-400/20 text-teal-400'
                                                    }`}>
                                                        {spot.risk} Risk
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between mt-2">
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-lg font-black text-white">{spot.count}</span>
                                                        <span className="text-[9px] font-bold text-teal-100/40 uppercase">Incidents</span>
                                                    </div>
                                                    <div className={`flex items-center gap-1 ${
                                                        spot.trend === 'up' ? 'text-red-400' :
                                                        spot.trend === 'down' ? 'text-teal-400' :
                                                        'text-teal-100/40'
                                                    }`}>
                                                        {spot.trend === 'up' ? (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                                            </svg>
                                                        ) : spot.trend === 'down' ? (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                                                            </svg>
                                                        ) : (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14" />
                                                            </svg>
                                                        )}
                                                        <span className="text-[10px] font-black uppercase">{spot.trend}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Legend in Dropdown */}
                                <div className="pt-6 border-t border-teal-800/30">
                                    <label className="text-[10px] font-black text-teal-100/40 uppercase tracking-widest mb-3 block">Density Legend</label>
                                    <div className="h-2 w-full bg-gradient-to-r from-teal-500 via-yellow-500 to-[#F97316] rounded-full mb-2"></div>
                                    <div className="flex justify-between text-[9px] font-black text-teal-100/40 uppercase tracking-tighter">
                                        <span>Low Density</span>
                                        <span>Critical</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Floating Time Legend */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[9999] w-full max-w-md px-6">
                        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-6 rounded-[2.5rem] shadow-2xl">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Temporal Activity Flow</span>
                                <span className="text-[10px] font-black text-orange-500 uppercase">Live Pulse</span>
                            </div>
                            <div className="flex items-end gap-1 h-8">
                                {[30, 45, 25, 60, 85, 40, 35, 55, 75, 90, 65, 45, 30, 25, 50, 70].map((h, i) => (
                                    <div 
                                        key={i} 
                                        className="flex-1 bg-slate-800 rounded-t-sm transition-all duration-500 hover:bg-orange-500" 
                                        style={{ height: `${h}%` }}
                                    ></div>
                                ))}
                            </div>
                            <div className="flex justify-between mt-2 text-[8px] font-bold text-slate-500 uppercase">
                                <span>00:00</span>
                                <span>06:00</span>
                                <span>12:00</span>
                                <span>18:00</span>
                                <span>23:59</span>
                            </div>
                        </div>
                    </div>

                    {/* The Actual Map */}
                    <div className="w-full h-full relative">
                        {loading && (
                            <div className="absolute inset-0 z-[10000] bg-[#1B4340]/40 backdrop-blur-md flex items-center justify-center">
                                <div className="flex flex-col items-center">
                                    <div className="w-12 h-12 border-4 border-teal-100/20 border-t-[#F97316] rounded-full animate-spin mb-4"></div>
                                    <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] animate-pulse">Syncing Activity Data</span>
                                </div>
                            </div>
                        )}
                        <MapComponent 
                            height="100%"
                            center={[14.8093, 121.0028]} // San Vicente Core
                            zoom={16}
                            showHeatmap={true}
                        />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminHeatMap;
