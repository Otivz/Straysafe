import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BrgySidebar from '../../components/BrgySidebar';
import BrgyNavbar from '../../components/Navbars/BrgyNavbar';
import Button from '../../components/Button';
import MapComponent from '../../components/MapComponent';

interface RescueRequest {
    request_id: number;
    report_id: number;
    leader_id: number;
    title: string;
    description: string;
    status_id: number;
    created_at: string;
    report?: {
        category_id: number;
        priority_level: string;
        latitude: number;
        longitude: number;
        landmark: string;
        animal_count: number;
        description: string;
        reporter_name?: string;
        status_id: number;
        media?: { media_id: number; file_url: string; media_type: string }[];
    };
    leader_name?: string;
}

const statusMap: Record<number, string> = {
    1: 'Pending Approval',
    2: 'Approved',
    3: 'Rejected',
    4: 'Team Dispatched',
    5: 'In Progress',
    6: 'Resolved'
};

const reportStatusMap: Record<number, string> = {
    1: 'Pending Verification',
    2: 'Verified',
    3: 'Rejected',
    4: 'Escalated to Barangay',
    5: 'Rescue In Progress',
    6: 'Resolved',
    7: 'Picked Up',
    8: 'Under Observation',
    9: 'Impounded',
    10: 'Released'
};

const categoryMap: Record<number, string> = {
    1: 'Injured Animal',
    2: 'Aggressive Stray',
    3: 'Possible Rabies Risk',
    4: 'Roaming Pack',
    5: 'Animal Rescue Needed'
};

const BrgyRescueRequests = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState<RescueRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewingRequest, setViewingRequest] = useState<RescueRequest | null>(null);

    const userStr = localStorage.getItem('staff_user') || sessionStorage.getItem('staff_user');
    const currentUser = userStr ? JSON.parse(userStr) : null;

    useEffect(() => {
        if (!userStr || currentUser?.role_id !== 3) {
            navigate('/staff/login');
        }
    }, [navigate, userStr, currentUser]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8000/rescue-requests/');
            setRequests(response.data);
        } catch (error) {
            console.error('Error fetching rescue requests:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleUpdateStatus = async (requestId: number, reportId: number, newStatusId: number) => {
        try {
            // Only update rescue-request status if it's 1 (Pending), 2 (Approved), or 3 (Rejected)
            // For detailed rescue progress (IDs 6-10), we keep the request at status 2 (Approved)
            const requestStatusId = newStatusId > 3 ? 2 : newStatusId;

            await axios.patch(`http://localhost:8000/rescue-requests/${requestId}`, {
                status_id: requestStatusId,
                barangay_staff_id: currentUser?.user_id
            });

            let reportStatus = 4; // Escalated
            if (newStatusId === 2) reportStatus = 5; // Rescue In Progress
            if (newStatusId === 3) reportStatus = 3; // Rejected/Closed
            if (newStatusId >= 6) reportStatus = newStatusId; // Detailed Rescue Statuses (7, 8, 9, 10, 6)

            await axios.patch(`http://localhost:8000/reports/${reportId}/status`, { status_id: reportStatus });

            setViewingRequest(null);
            fetchRequests();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status.');
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-[#F8F9FA] font-sans text-gray-800">
            <BrgySidebar />

            <main className="flex-1 flex flex-col h-screen overflow-hidden">
                <BrgyNavbar />

                <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                    <div className="max-w-7xl mx-auto w-full">
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Rescue Requests</h1>
                                <p className="text-gray-500 text-sm">Review and approve rescue operations escalated by Subdivision Leaders.</p>
                            </div>
                            <Button variant="light" onClick={fetchRequests} className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Refresh
                            </Button>
                        </div>

                        <div className="bg-white rounded-3xl shadow-[0_2px_14px_rgba(0,0,0,0.02)] border border-gray-100 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50/50">
                                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Request ID</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Title</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Escalated By</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {loading ? (
                                            <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">Loading requests...</td></tr>
                                        ) : requests.length === 0 ? (
                                            <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">No pending rescue requests.</td></tr>
                                        ) : requests.map((req) => (
                                            <tr key={req.request_id} className="hover:bg-gray-50/30 transition-colors">
                                                <td className="px-6 py-4 text-xs font-mono text-gray-400">#REQ-{req.request_id.toString().padStart(4, '0')}</td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-bold text-gray-900">{req.title}</p>
                                                    <p className="text-[10px] text-gray-400 truncate max-w-[200px]">{req.description}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-[10px] font-bold text-orange-600">
                                                            {req.leader_name?.charAt(0) || 'L'}
                                                        </div>
                                                        <span className="text-xs text-gray-700">{req.leader_name || 'Subd Leader'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-xs text-gray-500">
                                                    {new Date(req.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${req.status_id === 1 ? 'bg-orange-50 text-orange-600' :
                                                        req.status_id === 2 ? 'bg-blue-50 text-blue-600' :
                                                            req.status_id === 6 ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-600'
                                                        }`}>
                                                        {req.status_id === 2 && req.report?.status_id && req.report.status_id > 5
                                                            ? reportStatusMap[req.report.status_id]
                                                            : statusMap[req.status_id]}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => setViewingRequest(req)}
                                                        className="text-[10px] font-bold text-[#F97316] hover:underline"
                                                    >
                                                        {req.status_id === 1 ? 'Review Request' : 'Update Status'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Review Modal */}
            {viewingRequest && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Rescue Request Approval</h3>
                                <p className="text-xs text-gray-500 mt-1">Review full incident intelligence and documentation</p>
                            </div>
                            <button onClick={() => setViewingRequest(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto custom-scrollbar flex-1 bg-[#FBFBFB]">
                            <div className="flex flex-col gap-6">

                                {/* 1. ESCALATION NOTE */}
                                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6">
                                    <h4 className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-4">Subdivision Escalation Note</h4>
                                    <h2 className="text-lg font-bold text-gray-900 mb-2">{viewingRequest.title}</h2>
                                    <p className="text-xs text-gray-600 leading-relaxed italic">"{viewingRequest.description}"</p>
                                </div>

                                {/* 2. OFFICIAL DOCUMENTS */}
                                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Official Documents</h4>
                                    {(() => {
                                        const doc = viewingRequest.report?.media?.find(m => m.media_type === 'Document');
                                        return (
                                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-red-600">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-xs font-bold text-gray-900 truncate">{doc ? 'Request_Letter.pdf' : 'No document found'}</p>
                                                    <p className="text-[9px] text-gray-400">Formal request from Subd Leader</p>
                                                </div>
                                                {doc && (() => {
                                                    const isPdf = doc.file_url.toLowerCase().endsWith('.pdf') || doc.media_type === 'Document';
                                                    let viewUrl = doc.file_url;
                                                    const isImageBucket = viewUrl.includes('/image/upload/');

                                                    if (isImageBucket) {
                                                        if (isPdf && !viewUrl.toLowerCase().endsWith('.pdf')) {
                                                            viewUrl += '.pdf';
                                                        }
                                                    }

                                                    // Use fl_attachment:filename to give the downloaded file a friendly name
                                                    const downloadUrl = doc.file_url.replace('/upload/', '/upload/fl_attachment:Request_Letter/');

                                                    return (
                                                        <div className="flex gap-2">
                                                            <a
                                                                href={viewUrl}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
                                                            >
                                                                View
                                                            </a>
                                                            <a
                                                                href={downloadUrl}
                                                                className="px-3 py-1.5 bg-orange-50 border border-orange-100 rounded-lg text-[10px] font-bold text-[#F97316] hover:bg-orange-100 transition-all shadow-sm"
                                                            >
                                                                Download
                                                            </a>
                                                        </div>
                                                    );
                                                })()}
                                            </div>
                                        );
                                    })()}
                                </div>

                                {/* 3. INCIDENT INTELLIGENCE */}
                                {viewingRequest.report && (
                                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Incident Intelligence</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Category</span>
                                                <span className="text-xs font-bold text-gray-900">{categoryMap[viewingRequest.report.category_id] || 'Injured Animal'}</span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Priority</span>
                                                <span className={`text-xs font-bold ${viewingRequest.report.priority_level === 'High' ? 'text-red-600' : 'text-orange-600'}`}>
                                                    {viewingRequest.report.priority_level || 'Regular'}
                                                </span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Reporter</span>
                                                <span className="text-xs font-bold text-gray-900">{viewingRequest.report.reporter_name || 'Citizen'}</span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Rescue Status</span>
                                                <span className="text-xs font-bold text-blue-600">
                                                    {viewingRequest.report.status_id >= 5 ? reportStatusMap[viewingRequest.report.status_id] : 'Not Yet Initiated'}
                                                </span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Animals</span>
                                                <span className="text-xs font-bold text-gray-900">{viewingRequest.report.animal_count || 1} observed</span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Landmark</span>
                                                <span className="text-xs font-bold text-gray-900">{viewingRequest.report.landmark || 'Sari-Sari Store'}</span>
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Coordinates</span>
                                                <span className="text-[10px] font-mono text-gray-500">
                                                    {viewingRequest.report.latitude.toFixed(8)}, {viewingRequest.report.longitude.toFixed(8)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* 4. DESCRIPTION */}
                                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Description</h4>
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <p className="text-xs text-gray-700 leading-relaxed">
                                            "{viewingRequest.report?.description || 'No detailed description provided.'}"
                                        </p>
                                    </div>
                                </div>

                                {/* 5. INCIDENT LOCATION MAP */}
                                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm overflow-hidden h-[300px] flex flex-col">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Incident Location Map</h4>
                                    <div className="flex-1 rounded-2xl overflow-hidden border border-gray-100">
                                        {viewingRequest.report && (
                                            <MapComponent
                                                center={[viewingRequest.report.latitude, viewingRequest.report.longitude]}
                                                zoom={17}
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* 6. ATTACHED MEDIA */}
                                <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Attached Media</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        {viewingRequest.report?.media && viewingRequest.report.media.length > 0 ? (
                                            viewingRequest.report.media.filter(m => m.media_type !== 'Document').map((m) => (
                                                <div key={m.media_id} className="flex flex-col gap-2">
                                                    <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm relative group">
                                                        {m.media_type === 'Video' ? (
                                                            <video
                                                                src={m.file_url}
                                                                controls
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <img src={m.file_url} alt="Incident" className="w-full h-full object-cover" />
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {(() => {
                                                            let viewUrl = m.file_url;
                                                            const isPdf = m.media_type === 'Document' || viewUrl.toLowerCase().endsWith('.pdf');
                                                            const isImageBucket = viewUrl.includes('/image/upload/');

                                                            if (isImageBucket) {
                                                                if (isPdf && !viewUrl.toLowerCase().endsWith('.pdf')) {
                                                                    viewUrl += '.pdf';
                                                                }
                                                            }

                                                            const downloadUrl = m.file_url.replace('/upload/', `/upload/fl_attachment:StraySafe_Media_${m.media_id}/`);

                                                            return (
                                                                <>
                                                                    <a
                                                                        href={viewUrl}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="flex-1 py-1 bg-white border border-gray-200 rounded-lg text-[9px] font-bold text-gray-600 hover:bg-gray-50 transition-all text-center"
                                                                    >
                                                                        View
                                                                    </a>
                                                                    <a
                                                                        href={downloadUrl}
                                                                        className="flex-1 py-1 bg-orange-50 border border-orange-100 rounded-lg text-[9px] font-bold text-[#F97316] hover:bg-orange-100 transition-all text-center"
                                                                    >
                                                                        Download
                                                                    </a>
                                                                </>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="col-span-2 py-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No Photos/Videos Attached</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 7. ACTION PANEL */}
                                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 text-center">
                                        {viewingRequest.status_id === 1 ? 'Dispatch Authorization' : 'Update Rescue Status'}
                                    </h4>
                                    <div className="flex flex-col gap-4">
                                        {viewingRequest.status_id === 1 ? (
                                            <>
                                                <button
                                                    onClick={() => handleUpdateStatus(viewingRequest.request_id, viewingRequest.report_id, 2)}
                                                    className="w-full py-4 bg-[#F97316] text-white rounded-2xl text-xs font-bold shadow-lg shadow-orange-100 hover:bg-[#EA580C] transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    APPROVE & DISPATCH RESCUE TEAM
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(viewingRequest.request_id, viewingRequest.report_id, 3)}
                                                    className="w-full py-3 border border-gray-100 rounded-2xl text-xs font-bold text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"
                                                >
                                                    REJECT CASE
                                                </button>
                                            </>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-3">
                                                {[
                                                    { id: 7, label: 'Picked Up', color: 'bg-blue-600' },
                                                    { id: 8, label: 'Under Observation', color: 'bg-amber-500' },
                                                    { id: 9, label: 'Impounded', color: 'bg-red-600' },
                                                    { id: 10, label: 'Released', color: 'bg-indigo-600' },
                                                    { id: 6, label: 'Resolved', color: 'bg-green-600', full: true }
                                                ].map((stat) => (
                                                    <button
                                                        key={stat.id}
                                                        onClick={() => handleUpdateStatus(viewingRequest.request_id, viewingRequest.report_id, stat.id)}
                                                        className={`${stat.full ? 'col-span-2' : ''} py-3 ${stat.color} text-white rounded-xl text-[10px] font-bold shadow-md hover:brightness-110 transition-all active:scale-95`}
                                                    >
                                                        {stat.label.toUpperCase()}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BrgyRescueRequests;
