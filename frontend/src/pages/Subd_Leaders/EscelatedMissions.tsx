import { useState } from 'react';
import SubdSidebar from '../../components/SubdSidebar';
import SubdNavbar from '../../components/Navbars/SubdNavbar';
import DataTable from '../../components/DataTable';

interface EscalatedMission {
    mission_id: string;
    report_id: number;
    title: string;
    description: string;
    escalated_date: string;
    barangay_status: 'Pending' | 'In Progress' | 'Resolved' | 'Rejected';
    reporter: string;
    landmark: string;
}

const EscelatedMissions = () => {
    const [loading] = useState(false);

    // Mock Data for UI demonstration
    const mockMissions: EscalatedMission[] = [
        {
            mission_id: "MSN-2024-001",
            report_id: 1042,
            title: "Aggressive Stray near Park",
            description: "Requesting immediate rescue for a large aggressive dog near the central playground.",
            escalated_date: "2024-05-12 10:30 AM",
            barangay_status: "In Progress",
            reporter: "John Doe",
            landmark: "Central Park Playground"
        },
        {
            mission_id: "MSN-2024-002",
            report_id: 1039,
            title: "Injured Cat Rescue",
            description: "Calico cat with injured leg found near block 5 entrance.",
            escalated_date: "2024-05-11 02:15 PM",
            barangay_status: "Pending",
            reporter: "Jane Smith",
            landmark: "Block 5 Main Gate"
        },
        {
            mission_id: "MSN-2024-003",
            report_id: 1025,
            title: "Roaming Pack Alert",
            description: "Pack of 5-6 dogs roaming near the subdivision perimeter fence.",
            escalated_date: "2024-05-10 08:00 AM",
            barangay_status: "Resolved",
            reporter: "Mike Ross",
            landmark: "North Perimeter Wall"
        }
    ];

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'In Progress': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'Resolved': return 'bg-green-50 text-green-600 border-green-100';
            case 'Rejected': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    return (
        <div className="flex h-screen bg-[#F8FAFC]">
            <SubdSidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <SubdNavbar />

                <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="max-w-7xl mx-auto">
                        
                        {/* Header Section */}
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Escalated Missions</h1>
                            <p className="text-gray-500 text-sm mt-1">Track reports forwarded to Barangay operations for immediate rescue.</p>
                        </div>

                        {/* Stats Overview */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                            {[
                                { label: 'Total Escalated', value: '12', color: 'bg-orange-500' },
                                { label: 'Pending Action', value: '4', color: 'bg-amber-500' },
                                { label: 'In Progress', value: '3', color: 'bg-blue-500' },
                                { label: 'Resolved', value: '5', color: 'bg-green-500' },
                            ].map((stat, i) => (
                                <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`w-2 h-2 rounded-full ${stat.color}`}></div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{stat.label}</span>
                                    </div>
                                    <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                                </div>
                            ))}
                        </div>

                        {/* Main Table Section */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <DataTable
                                loading={loading}
                                data={mockMissions}
                                emptyMessage="No escalated missions found."
                                loadingMessage="Fetching mission status..."
                                columns={[
                                    {
                                        header: "Mission ID",
                                        key: "mission_id",
                                        render: (m) => (
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900">{m.mission_id}</span>
                                                <span className="text-[10px] font-mono text-gray-400">Report #{m.report_id}</span>
                                            </div>
                                        )
                                    },
                                    {
                                        header: "Mission Title",
                                        key: "title",
                                        render: (m) => (
                                            <div className="max-w-[200px]">
                                                <span className="text-sm font-semibold text-gray-800 truncate block">{m.title}</span>
                                                <span className="text-xs text-gray-400 truncate block">{m.landmark}</span>
                                            </div>
                                        )
                                    },
                                    {
                                        header: "Escalated Date",
                                        key: "escalated_date",
                                        render: (m) => (
                                            <span className="text-xs text-gray-600 font-medium">{m.escalated_date}</span>
                                        )
                                    },
                                    {
                                        header: "Barangay Status",
                                        key: "barangay_status",
                                        render: (m) => (
                                            <div className="flex items-center space-x-2">
                                                {m.barangay_status === 'In Progress' && (
                                                    <span className="relative flex h-2 w-2">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                                    </span>
                                                )}
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusStyle(m.barangay_status)}`}>
                                                    {m.barangay_status}
                                                </span>
                                            </div>
                                        )
                                    },
                                    {
                                        header: "Reporter",
                                        key: "reporter",
                                        render: (m) => (
                                            <div className="flex items-center space-x-2">
                                                <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-500 font-bold">
                                                    {m.reporter.charAt(0)}
                                                </div>
                                                <span className="text-xs font-semibold text-gray-700">{m.reporter}</span>
                                            </div>
                                        )
                                    },
                                    {
                                        header: "Action",
                                        key: "action",
                                        render: () => (
                                            <button className="text-xs font-bold text-[#F97316] hover:text-[#EA580C] uppercase tracking-widest transition-colors">
                                                View Tracker
                                            </button>
                                        )
                                    }
                                ]}
                            />
                        </div>

                        {/* Info Tip */}
                        <div className="mt-8 bg-blue-50/50 border border-blue-100 rounded-2xl p-6 flex items-start space-x-4">
                            <div className="bg-blue-500 p-2 rounded-lg text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-blue-900">Mission Tracking Note</h4>
                                <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                                    Missions in this list have been officially endorsed to the Barangay. 
                                    Status updates are synchronized live from the Barangay's Operations Hub. 
                                    If a mission is "Rejected", please check your endorsement letter for missing details.
                                </p>
                            </div>
                        </div>

                    </div>
                </main>
            </div>
        </div>
    );
};

export default EscelatedMissions;
