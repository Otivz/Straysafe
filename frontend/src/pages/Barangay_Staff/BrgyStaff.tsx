import { useState, useEffect } from 'react';
import BrgySidebar from '../../components/BrgySidebar';
import BrgyNavbar from '../../components/Navbars/BrgyNavbar';
import DataTable from '../../components/DataTable';
import Button from '../../components/Button';

interface Personnel {
    id: number;
    name: string;
    position: string;
    contact: string;
    email: string;
    barangay: string;
    currentAssignment: string;
    assignedRescueId: string;
    assignmentStatus: 'Available' | 'Assigned' | 'In Transit' | 'On Site' | 'Completed' | 'Off Duty';
    completedRescues: number;
    availabilityStatus: string;
    profilePicture: string | null;
    successRate: string;
    responseTime: string;
    highRiskCases: number;
}

const BrgyStaff = () => {
    const [personnelList, setPersonnelList] = useState<Personnel[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPersonnel, setSelectedPersonnel] = useState<Personnel | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    useEffect(() => {
        // Mock Data for Personnel
        const mockPersonnel: Personnel[] = [
            {
                id: 1,
                name: 'Ricardo Reyes',
                position: 'Rescue Lead',
                contact: '09123456789',
                email: 'ricardo.reyes@stray.gov',
                barangay: 'San Vicente',
                currentAssignment: 'Stray Dog Rescue - Zone 4',
                assignedRescueId: 'REQ-2024-001',
                assignmentStatus: 'On Site',
                completedRescues: 45,
                availabilityStatus: 'Active',
                profilePicture: null,
                successRate: '98%',
                responseTime: '12m',
                highRiskCases: 12
            },
            {
                id: 2,
                name: 'Juan Dela Cruz',
                position: 'Rescue Officer',
                contact: '09987654321',
                email: 'juan.delacruz@stray.gov',
                barangay: 'San Vicente',
                currentAssignment: 'Injured Cat Report - Phase 2',
                assignedRescueId: 'REQ-2024-015',
                assignmentStatus: 'In Transit',
                completedRescues: 32,
                availabilityStatus: 'Active',
                profilePicture: null,
                successRate: '95%',
                responseTime: '15m',
                highRiskCases: 8
            },
            {
                id: 3,
                name: 'Maria Santos',
                position: 'Medical Assistant',
                contact: '09112233445',
                email: 'maria.santos@stray.gov',
                barangay: 'San Vicente',
                currentAssignment: 'Post-Rescue Checkup',
                assignedRescueId: 'REQ-2024-009',
                assignmentStatus: 'Completed',
                completedRescues: 60,
                availabilityStatus: 'Available',
                profilePicture: null,
                successRate: '99%',
                responseTime: '10m',
                highRiskCases: 5
            },
            {
                id: 4,
                name: 'Antonio Luna',
                position: 'Rescue Officer',
                contact: '09554433221',
                email: 'antonio.luna@stray.gov',
                barangay: 'San Vicente',
                currentAssignment: 'Unassigned',
                assignedRescueId: 'N/A',
                assignmentStatus: 'Available',
                completedRescues: 28,
                availabilityStatus: 'Available',
                profilePicture: null,
                successRate: '92%',
                responseTime: '18m',
                highRiskCases: 3
            },
            {
                id: 5,
                name: 'Gregorio del Pilar',
                position: 'Trainee',
                contact: '09778899001',
                email: 'gregorio.pilar@stray.gov',
                barangay: 'San Vicente',
                currentAssignment: 'Equipment Maintenance',
                assignedRescueId: 'N/A',
                assignmentStatus: 'Off Duty',
                completedRescues: 5,
                availabilityStatus: 'Off Duty',
                profilePicture: null,
                successRate: '85%',
                responseTime: '25m',
                highRiskCases: 0
            },
            {
                id: 6,
                name: 'Melchora Aquino',
                position: 'Rescue Lead',
                contact: '09223344556',
                email: 'melchora.aquino@stray.gov',
                barangay: 'San Vicente',
                currentAssignment: 'Emergency Dispatch',
                assignedRescueId: 'REQ-2024-022',
                assignmentStatus: 'Assigned',
                completedRescues: 120,
                availabilityStatus: 'Active',
                profilePicture: null,
                successRate: '99%',
                responseTime: '10m',
                highRiskCases: 35
            }
        ];
        setPersonnelList(mockPersonnel);
        setLoading(false);
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Available': return 'bg-green-50 text-green-600 border-green-100';
            case 'Assigned': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'In Transit': return 'bg-orange-50 text-orange-600 border-orange-100';
            case 'On Site': return 'bg-purple-50 text-purple-600 border-purple-100';
            case 'Off Duty': return 'bg-gray-100 text-gray-500 border-gray-200';
            default: return 'bg-gray-50 text-gray-400 border-gray-100';
        }
    };

    return (
        <div className="flex h-screen bg-[#F8F9FA] text-gray-800 overflow-hidden font-sans">
            <BrgySidebar />

            <div className="flex-1 flex flex-col h-screen relative overflow-hidden">
                <BrgyNavbar />

                <main className="flex-1 overflow-hidden p-10 bg-gradient-to-br from-[#F8F9FA] to-[#F1F5F9] flex flex-col">
                    <div className="max-w-[1600px] mx-auto w-full flex-1 flex flex-col min-h-0 space-y-10">
                        
                        {/* Page Header */}
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 shrink-0">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Assigned Personnel</h1>
                                </div>
                                <p className="text-gray-500 text-sm">
                                    Strategic Management, Deployment Monitoring & Field Operation Analytics
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <Button variant="light" className="px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                                    Add Personnel
                                </Button>
                                <Button variant="light" className="px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                                    Assign Rescue
                                </Button>
                                <Button variant="primary" className="px-6 py-3 bg-[#F97316] text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-[#F97316]/20 hover:bg-[#EA580C] transition-all flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M16 9l-4-4m0 0L8 5m4-4v12" /></svg>
                                    Export Personnel Report
                                </Button>
                            </div>
                        </div>

                        <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-8 min-h-0">
                            {/* Left Side: Stats and Table */}
                            <div className="xl:col-span-3 flex flex-col min-h-0 space-y-10">
                                {/* Analytics Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0">
                                    {[
                                        { label: 'Total Personnel', value: '24', sub: 'Active Force', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>, color: 'text-blue-600', bg: 'bg-blue-50' },
                                        { label: 'Available', value: '14', sub: 'Ready for Dispatch', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, color: 'text-green-600', bg: 'bg-green-50' },
                                        { label: 'Active Deployments', value: '8', sub: 'Ongoing Ops', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>, color: 'text-orange-600', bg: 'bg-orange-50' },
                                        { label: 'Completed Today', value: '12', sub: 'Successfully Closed', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>, color: 'text-teal-600', bg: 'bg-teal-50' },
                                    ].map((stat, i) => (
                                        <div key={i} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-all duration-300 h-32">
                                            <div className="flex justify-between items-start">
                                                <div className={`w-10 h-10 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center`}>
                                                    {stat.icon}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-2xl font-black text-gray-900 leading-tight">{stat.value}</p>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{stat.label}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Personnel Management Table */}
                                <div className="flex-1 min-h-0 bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                                        <DataTable
                                            loading={loading}
                                            data={personnelList}
                                            emptyMessage="No personnel records found."
                                            columns={[
                                                {
                                                    header: "Personnel",
                                                    key: "name",
                                                    render: (p) => (
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold border-2 border-white shadow-sm overflow-hidden">
                                                                {p.profilePicture ? <img src={p.profilePicture} alt={p.name} className="w-full h-full object-cover" /> : p.name.charAt(0)}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black text-gray-900 leading-none">{p.name}</p>
                                                                <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">{p.position}</p>
                                                            </div>
                                                        </div>
                                                    )
                                                },
                                                {
                                                    header: "Current Task",
                                                    key: "assignment",
                                                    render: (p) => (
                                                        <div>
                                                            <p className="text-xs font-bold text-gray-700 leading-none">{p.currentAssignment}</p>
                                                            <span className="text-[9px] font-mono text-gray-400 uppercase">{p.assignedRescueId}</span>
                                                        </div>
                                                    )
                                                },
                                                {
                                                    header: "Stats",
                                                    key: "stats",
                                                    render: (p) => (
                                                        <div className="flex items-center gap-4">
                                                            <div className="text-center">
                                                                <p className="text-[10px] font-black text-gray-900 leading-none">{p.completedRescues}</p>
                                                                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5">Resolved</p>
                                                            </div>
                                                            <div className="text-center">
                                                                <p className="text-[10px] font-black text-[#F97316] leading-none">{p.successRate}</p>
                                                                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5">Success</p>
                                                            </div>
                                                        </div>
                                                    )
                                                },
                                                {
                                                    header: "Operational Status",
                                                    key: "status",
                                                    render: (p) => (
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(p.assignmentStatus)}`}>
                                                            {p.assignmentStatus}
                                                        </span>
                                                    )
                                                },
                                                {
                                                    header: "Actions",
                                                    key: "actions",
                                                    className: "text-right",
                                                    render: (p) => (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button onClick={() => { setSelectedPersonnel(p); setIsDrawerOpen(true); }} className="p-2 bg-gray-50 text-gray-400 hover:text-[#F97316] hover:bg-orange-50 rounded-xl transition-all" title="View Personnel">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                            </button>
                                                            <button className="p-2 bg-gray-50 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all" title="Assign Rescue">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                            </button>
                                                            <button className="p-2 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all" title="View History">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                            </button>
                                                        </div>
                                                    )
                                                }
                                            ]}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Live Deployment Monitoring Panel */}
                            <div className="xl:col-span-1 min-h-0 flex flex-col">
                                <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/40 border border-gray-100 flex flex-col h-full overflow-hidden">
                                    <div className="flex justify-between items-center mb-8 shrink-0">
                                        <div>
                                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight">Live Deployment</h3>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Real-time Field Operations</p>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-50 rounded-lg animate-pulse">
                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                            <span className="text-[8px] font-black text-red-600 uppercase">Live</span>
                                        </div>
                                    </div>

                                    <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                                        {[1, 2, 3, 4, 5, 6].map((_, i) => (
                                            <div key={i} className="bg-gray-50/50 border border-gray-100 rounded-3xl p-5 space-y-4 hover:border-orange-200 hover:bg-white transition-all cursor-pointer group shadow-sm hover:shadow-md">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[10px] font-black text-[#1B4340] border border-gray-100 shadow-sm">
                                                            {i % 2 === 0 ? 'J' : 'M'}
                                                        </div>
                                                        <div>
                                                            <p className="text-[11px] font-black text-gray-900 leading-none">{i % 2 === 0 ? 'Juan Dela Cruz' : 'Maria Santos'}</p>
                                                            <p className="text-[9px] font-bold text-gray-400 mt-1 uppercase tracking-tighter">Officer Level {3-(i%2)}</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-[8px] font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md uppercase">On Site</span>
                                                </div>

                                                <div className="bg-white/80 rounded-2xl p-3 border border-gray-100/50 space-y-2">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Rescue ID</span>
                                                        <span className="text-[9px] font-mono font-bold text-gray-900">#REQ-00{42+i}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between pt-2 border-t border-gray-100 border-dashed">
                                                    <div className="flex items-center gap-1 text-gray-400">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                        <span className="text-[9px] font-black uppercase">42m 15s</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <Button variant="light" className="w-full mt-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl bg-[#F97316] text-white hover:bg-[#EA580C] shadow-lg shadow-[#F97316]/20 shrink-0">
                                        View All Deployments
                                    </Button>
                                </div>
                            </div>
                        </div>

                    </div>
                </main>
            </div>

            {/* Personnel Intelligence Drawer */}
            {isDrawerOpen && selectedPersonnel && (
                <div className="fixed inset-0 z-[1000] overflow-hidden">
                    <div className="absolute inset-0 bg-[#1B4340]/40 backdrop-blur-md transition-opacity duration-500" onClick={() => setIsDrawerOpen(false)}></div>
                    <div className="absolute right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 overflow-hidden">
                        
                        <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 h-[100px] shrink-0">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Personnel Intelligence</h2>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Detailed Operational Profile & Field History</p>
                            </div>
                            <button onClick={() => setIsDrawerOpen(false)} className="p-3 bg-white border border-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all shadow-sm">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-10 pb-20">
                            
                            {/* 1. Personnel Information */}
                            <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm flex flex-col md:flex-row gap-8 items-center md:items-start group">
                                <div className="w-40 h-40 rounded-3xl bg-orange-100 flex items-center justify-center text-orange-600 font-black text-5xl border-4 border-white shadow-xl overflow-hidden shrink-0 group-hover:scale-[1.02] transition-transform">
                                    {selectedPersonnel.profilePicture ? <img src={selectedPersonnel.profilePicture} alt={selectedPersonnel.name} className="w-full h-full object-cover" /> : selectedPersonnel.name.charAt(0)}
                                </div>
                                <div className="flex-1 space-y-4">
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-3 py-1 bg-[#F97316] text-white rounded-lg text-[9px] font-black uppercase tracking-widest">{selectedPersonnel.position}</span>
                                        <span className="px-3 py-1 bg-green-50 text-green-600 border border-green-100 rounded-lg text-[9px] font-black uppercase tracking-widest italic">Active Duty</span>
                                        <span className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-[9px] font-black uppercase tracking-widest">Verified</span>
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black text-gray-900 tracking-tight">{selectedPersonnel.name}</h3>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">Personnel ID: #STAFF-00{selectedPersonnel.id}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100">
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Contact</p>
                                            <p className="text-[11px] font-bold text-gray-700">{selectedPersonnel.contact}</p>
                                        </div>
                                        <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100">
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Email</p>
                                            <p className="text-[11px] font-bold text-gray-700 truncate">{selectedPersonnel.email}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 2. Key Performance Indicators */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: 'Total Operations', value: selectedPersonnel.completedRescues, sub: 'Lifetime', color: 'text-teal-600', bg: 'bg-teal-50' },
                                    { label: 'Success Rate', value: selectedPersonnel.successRate, sub: 'Historical', color: 'text-orange-600', bg: 'bg-orange-50' },
                                    { label: 'Avg Response', value: selectedPersonnel.responseTime, sub: 'Real-time', color: 'text-blue-600', bg: 'bg-blue-50' },
                                    { label: 'Risk Rating', value: 'High', sub: 'Classification', color: 'text-red-600', bg: 'bg-red-50' },
                                ].map((kpi, idx) => (
                                    <div key={idx} className={`${kpi.bg} rounded-[2rem] p-5 border border-white/20 shadow-sm`}>
                                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">{kpi.label}</p>
                                        <p className={`text-xl font-black ${kpi.color} leading-none`}>{kpi.value}</p>
                                        <p className="text-[8px] font-bold text-gray-400 mt-1 italic uppercase">{kpi.sub}</p>
                                    </div>
                                ))}
                            </div>

                            {/* 3. Live Mission Tracker */}
                            <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
                                <div className="flex justify-between items-center mb-10">
                                    <div>
                                        <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Active Mission Timeline</h4>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Current Deployment Trace</p>
                                    </div>
                                    <span className="px-3 py-1 bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-widest rounded-lg animate-pulse">Live Tracking</span>
                                </div>
                                <div className="relative">
                                    {/* Timeline Line */}
                                    <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-100"></div>
                                    <div className="absolute top-5 left-0 w-[60%] h-0.5 bg-[#F97316]"></div>
                                    
                                    <div className="flex justify-between items-start relative">
                                        {[
                                            { label: 'Assigned', time: '09:40' },
                                            { label: 'Transit', time: '09:55' },
                                            { label: 'On Site', time: '10:05' },
                                            { label: 'Capture', time: '--:--' },
                                            { label: 'Complete', time: '--:--' },
                                        ].map((step, idx) => (
                                            <div key={idx} className="relative z-10 flex flex-col items-center">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${idx <= 2 ? 'bg-[#F97316] text-white shadow-lg' : 'bg-white text-gray-200 border border-gray-100'}`}>
                                                    {idx <= 1 ? (
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                                    ) : (
                                                        <span className="text-xs font-black">{idx + 1}</span>
                                                    )}
                                                </div>
                                                <p className="text-[9px] font-black text-gray-900 uppercase mt-4">{step.label}</p>
                                                <p className="text-[8px] font-bold text-gray-400 mt-1">{step.time}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* 4. Equipment & Logistics */}
                            <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
                                <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Assigned Equipment</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { name: 'Rescue Vehicle', id: '#VH-042', status: 'In Use' },
                                        { name: 'Capture Gear', id: '#GR-901', status: 'Operational' },
                                        { name: 'Med-Kit (Adv)', id: '#MK-112', status: 'Ready' },
                                        { name: 'Comm Device', id: '#CM-883', status: 'Active' },
                                    ].map((item, idx) => (
                                        <div key={idx} className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 group hover:bg-white transition-all">
                                            <p className="text-[10px] font-black text-gray-900 group-hover:text-orange-600 transition-colors">{item.name}</p>
                                            <p className="text-[8px] font-bold text-gray-400 uppercase mt-1">{item.id}</p>
                                            <span className="inline-block mt-2 text-[7px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-md uppercase tracking-widest">{item.status}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 5. Performance Analytics - Static Placeholders */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm">
                                    <h5 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-6">Monthly Assignments</h5>
                                    <div className="h-40 w-full flex items-end justify-between gap-2 px-2">
                                        {[40, 65, 85, 55, 90, 70].map((h, i) => (
                                            <div key={i} className="flex-1 bg-[#1B4340]/10 rounded-t-lg relative group overflow-hidden">
                                                <div className="absolute bottom-0 left-0 right-0 bg-[#F97316] transition-all duration-500 rounded-t-lg" style={{ height: `${h}%` }}></div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between mt-3 text-[8px] font-black text-gray-400 uppercase px-1">
                                        <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                                    </div>
                                </div>
                                <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm">
                                    <h5 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-6">Response Accuracy</h5>
                                    <div className="flex items-center justify-center h-40">
                                        <div className="relative w-28 h-28">
                                            <svg className="w-full h-full transform -rotate-90">
                                                <circle cx="56" cy="56" r="50" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                                                <circle cx="56" cy="56" r="50" fill="none" stroke="#F97316" strokeWidth="10" strokeDasharray="314" strokeDashoffset="40" strokeLinecap="round" />
                                            </svg>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-xl font-black text-gray-900 leading-none">87%</span>
                                                <span className="text-[8px] font-black text-gray-400 uppercase">Target</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex gap-4 h-[100px] shrink-0">
                            <Button variant="light" className="flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl bg-white border-gray-200 shadow-sm hover:bg-gray-100">
                                Edit Account
                            </Button>
                            <Button variant="primary" className="flex-[2] py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl bg-[#F97316] text-white shadow-lg shadow-[#F97316]/20 hover:bg-[#EA580C]">
                                Download Performance PDF
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BrgyStaff;
