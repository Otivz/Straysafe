import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import BrgySidebar from '../../components/BrgySidebar';
import BrgyNavbar from '../../components/Navbars/BrgyNavbar';
import Button from '../../components/Button';
import MapComponent from '../../components/MapComponent';

interface RescueRequest {
    rescue_id: number;
    report_id: number;
    leader_id: number;
    title: string;
    description: string;
    status_id: number;
    created_at: string;
    report?: {
        category_id: number;
        animal_type: string;
        breed?: string;
        condition: string;
        behavior_tags?: string;
        priority_level: string;
        latitude: number;
        longitude: number;
        landmark: string;
        animal_count: number;
        description: string;
        reporter_name?: string;
        status_id: number;
        created_at: string;
        media?: { media_id: number; file_url: string; media_type: string }[];
    };
    leader_name?: string;
}

const statusMap: Record<number, string> = {
    1: 'Pending Approval',
    2: 'Approved',
    3: 'Rejected',
    4: 'Operation Started',
    5: 'Dispatched',
    6: 'Resolved'
};

const reportStatusMap: Record<number, string> = {
    1: 'Pending Verification',
    2: 'Verified',
    3: 'Rejected',
    4: 'Forwarded to Barangay',
    5: 'Team Dispatched',
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
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [statusToUpdate, setStatusToUpdate] = useState<{ requestId: number, reportId: number, statusId: number } | null>(null);
    const [statusMediaFiles, setStatusMediaFiles] = useState<File[]>([]);
    const [isUpdating, setIsUpdating] = useState(false);
    const [statusUpdateMessage, setStatusUpdateMessage] = useState('');
    const [statusUpdateCondition, setStatusUpdateCondition] = useState('');
    const [activeGallery, setActiveGallery] = useState<{ media: any[], index: number } | null>(null);

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

    const executeStatusUpdate = async (requestId: number, reportId: number, statusId: number, mediaFiles: File[], message: string = "", condition: string = "") => {
        if (!currentUser) return;

        try {
            setIsUpdating(true);

            // 1. Update Rescue Request Status
            const requestStatusId = statusId > 3 ? 2 : statusId;
            await axios.patch(`http://localhost:8000/rescue-requests/${requestId}`, {
                status_id: requestStatusId,
                barangay_staff_id: currentUser?.user_id
            });

            // 2. Update Report Status
            const reportStatus = statusId;

            const statusResponse = await axios.patch(`http://localhost:8000/reports/${reportId}/status`, {
                status_id: reportStatus,
                status_remarks: message,
                animal_condition: condition
            });

            // 3. Upload Media if present
            if (mediaFiles.length > 0) {
                const newHistoryId = statusResponse.data.history?.slice(-1)[0]?.history_id;
                let failCount = 0;
                for (const file of mediaFiles) {
                    const mediaData = new FormData();
                    mediaData.append("file", file);
                    mediaData.append("is_evidence", "true");
                    if (newHistoryId) {
                        mediaData.append("history_id", newHistoryId.toString());
                    }
                    try {
                        await axios.post(`http://localhost:8000/reports/${reportId}/media`, mediaData, {
                            headers: { 'Content-Type': 'multipart/form-data' }
                        });
                    } catch (err) {
                        console.error('Failed to upload status media:', err);
                        failCount++;
                    }
                }
                if (failCount > 0) {
                    alert(`${failCount} evidence files failed to upload.`);
                }
            }

            // Update local state for immediate UI feedback
            if (viewingRequest) {
                const updatedRequest = {
                    ...viewingRequest,
                    status_id: requestStatusId,
                    report: {
                        ...viewingRequest.report,
                        status_id: reportStatus
                    }
                };
                setViewingRequest(updatedRequest as any);
            }

            setIsStatusModalOpen(false);
            // setViewingRequest(null); // Keep it open but updated
            setStatusToUpdate(null);
            setStatusMediaFiles([]);
            setStatusUpdateMessage('');
            setStatusUpdateCondition('');
            fetchRequests();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status.');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleUpdateStatus = () => {
        if (!statusToUpdate) return;
        executeStatusUpdate(statusToUpdate.requestId, statusToUpdate.reportId, statusToUpdate.statusId, statusMediaFiles, statusUpdateMessage, statusUpdateCondition);
    };

    const openStatusUpdate = (requestId: number, reportId: number, statusId: number) => {
        if (statusId === 2 || statusId === 3) {
            executeStatusUpdate(requestId, reportId, statusId, [], "");
        } else {
            setStatusToUpdate({ requestId, reportId, statusId });
            setIsStatusModalOpen(true);
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
                                        ) : requests.map((req, index) => (
                                            <tr key={req.rescue_id || index} className="hover:bg-gray-50/30 transition-colors">
                                                <td className="px-6 py-4 text-xs font-mono text-gray-400">#REQ-{(req.rescue_id || 0).toString().padStart(4, '0')}</td>
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
                                                    {new Date(req.created_at || req.report?.created_at || Date.now()).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {(() => {
                                                        const isApproved = req.status_id === 2;
                                                        const reportStatus = req.report?.status_id;

                                                        let label = statusMap[req.status_id];
                                                        let colorClass = "bg-orange-50 text-orange-600"; // Default Pending

                                                        if (req.status_id === 3) {
                                                            label = "Rejected";
                                                            colorClass = "bg-red-50 text-red-600";
                                                        } else if (isApproved && reportStatus) {
                                                            label = reportStatusMap[reportStatus] || "Approved";

                                                            // Color mapping based on report status
                                                            if (reportStatus === 5) colorClass = "bg-blue-50 text-blue-600 border border-blue-100"; // In Progress
                                                            if (reportStatus === 6) colorClass = "bg-green-50 text-green-600 border border-green-100"; // Resolved
                                                            if (reportStatus === 7) colorClass = "bg-indigo-50 text-indigo-600 border border-indigo-100"; // Picked Up
                                                            if (reportStatus === 9) colorClass = "bg-purple-50 text-purple-600 border border-purple-100"; // Impounded
                                                            if (reportStatus === 10) colorClass = "bg-emerald-50 text-emerald-600 border border-emerald-100"; // Released
                                                        }

                                                        return (
                                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${colorClass}`}>
                                                                {label}
                                                            </span>
                                                        );
                                                    })()}
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

                        <div className="overflow-y-auto custom-scrollbar flex-1 bg-[#FBFBFB]">
                            {/* Rescue Progress Tracker (6 Stages) */}
                            <div className="px-8 py-10 bg-white border-b border-gray-100/50">
                                <div className="flex items-center justify-between relative px-2">
                                    <div className="absolute top-5 left-10 right-10 h-0.5 bg-gray-100 z-0">
                                        <div
                                            className="h-full bg-orange-500 transition-all duration-700"
                                            style={{
                                                width: `${(() => {
                                                    const stages = [1, 4, 5, 7, 9, 6];
                                                    const currentIndex = stages.indexOf(viewingRequest.report?.status_id);
                                                    return currentIndex === -1 ? 0 : (currentIndex / (stages.length - 1)) * 100;
                                                })()}%`
                                            }}
                                        />
                                    </div>

                                    {[
                                        { id: 1, label: 'Reported' },
                                        { id: 4, label: 'Verified' },
                                        { id: 5, label: 'Dispatched' },
                                        { id: 7, label: 'Picked Up' },
                                        { id: 9, label: 'Impounded' },
                                        { id: 6, label: 'Resolved' }
                                    ].map((stage, idx) => {
                                        const isCompleted = [1, 4, 5, 7, 9, 6].indexOf(viewingRequest.report?.status_id) >= idx;
                                        const isCurrent = viewingRequest.report?.status_id === stage.id;

                                        return (
                                            <div key={stage.id} className="relative z-10 flex flex-col items-center">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isCurrent ? 'bg-orange-500 text-white shadow-md ring-4 ring-orange-50' :
                                                        isCompleted ? 'bg-orange-100 text-orange-600 border border-orange-200' :
                                                            'bg-white text-gray-200 border border-gray-100'
                                                    }`}>
                                                    {isCompleted ? (
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                                    ) : (
                                                        <span className="text-xs font-black">{idx + 1}</span>
                                                    )}
                                                </div>
                                                <span className={`mt-2 text-[8px] font-black uppercase tracking-widest ${isCurrent ? 'text-orange-600' : isCompleted ? 'text-gray-600' : 'text-gray-300'}`}>
                                                    {stage.label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="p-8 flex flex-col gap-6">

                                {/* 1. ESCALATION NOTE */}
                                <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6">
                                    <h4 className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-4">Subdivision Escalation Note</h4>
                                    <p className="text-sm font-bold text-gray-900 leading-relaxed italic">"{viewingRequest.description}"</p>
                                    <div className="mt-4 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center text-[10px] font-bold text-orange-700 border-2 border-white">
                                            {viewingRequest.leader_name?.charAt(0) || 'L'}
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-gray-900">{viewingRequest.leader_name}</p>
                                            <p className="text-[9px] text-gray-500 uppercase tracking-widest mb-2">Subdivision Leader • {new Date(viewingRequest.created_at || viewingRequest.report?.created_at || Date.now()).toLocaleDateString()}</p>
                                            
                                            {/* Letter Actions */}
                                            {viewingRequest.report?.media?.some(m => m.media_type === 'Document' || m.file_url.toLowerCase().endsWith('.pdf') || m.file_url.toLowerCase().endsWith('.docx')) && (
                                                <div className="flex gap-2 mt-2">
                                                    <a 
                                                        href={viewingRequest.report.media.find(m => m.media_type === 'Document' || m.file_url.toLowerCase().endsWith('.pdf') || m.file_url.toLowerCase().endsWith('.docx'))?.file_url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-orange-200 transition-all border border-orange-200/50"
                                                    >
                                                        View Letter
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* 2. INCIDENT SPECS */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {[
                                        { label: 'Animal', value: viewingRequest.report?.animal_type || 'Unknown', color: 'blue' },
                                        { label: 'Condition', value: viewingRequest.report?.condition || 'Unknown', color: 'red' },
                                        { label: 'Priority', value: viewingRequest.report?.priority_level || 'Normal', color: 'orange' },
                                        { label: 'Count', value: viewingRequest.report?.animal_count || '1', color: 'gray' }
                                    ].map((spec, i) => (
                                        <div key={i} className="bg-white border border-gray-100 p-4 rounded-2xl">
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.15em] mb-1">{spec.label}</p>
                                            <p className={`text-xs font-black text-${spec.color}-600 uppercase tracking-widest`}>{spec.value}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* 3. ORIGINAL REPORT */}
                                <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-sm">
                                    <div className="flex items-start justify-between mb-6">
                                        <div>
                                            <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Original Resident Report</h4>
                                            <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-bold">Reported by {viewingRequest.report?.reporter_name}</p>
                                        </div>
                                        <span className="px-4 py-1.5 bg-gray-50 text-[10px] font-black text-gray-400 rounded-full border border-gray-100 uppercase tracking-widest">
                                            {categoryMap[viewingRequest.report?.category_id || 1]}
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-600 leading-relaxed mb-6 font-medium">
                                        {viewingRequest.report?.description}
                                    </p>

                                    {/* Media Grid */}
                                    {viewingRequest.report?.media && viewingRequest.report.media.filter(m => {
                                        const url = m.file_url.toLowerCase();
                                        return m.media_type !== 'Document' && 
                                               !url.endsWith('.pdf') && 
                                               !url.endsWith('.doc') && 
                                               !url.endsWith('.docx') && 
                                               !url.endsWith('.txt') && 
                                               !url.endsWith('.odt');
                                    }).length > 0 && (
                                        <div className="grid grid-cols-2 gap-3 mb-6">
                                            {viewingRequest.report.media.filter(m => {
                                                const url = m.file_url.toLowerCase();
                                                return m.media_type !== 'Document' && 
                                                       !url.endsWith('.pdf') && 
                                                       !url.endsWith('.doc') && 
                                                       !url.endsWith('.docx') && 
                                                       !url.endsWith('.txt') && 
                                                       !url.endsWith('.odt');
                                            }).slice(0, 4).map((m, idx) => (
                                                <div
                                                    key={idx}
                                                    className="relative aspect-video rounded-2xl overflow-hidden cursor-zoom-in group"
                                                    onClick={() => {
                                                        const filtered = viewingRequest.report!.media!.filter(m => {
                                                            const url = m.file_url.toLowerCase();
                                                            return m.media_type !== 'Document' && 
                                                                   !url.endsWith('.pdf') && 
                                                                   !url.endsWith('.doc') && 
                                                                   !url.endsWith('.docx') && 
                                                                   !url.endsWith('.txt') && 
                                                                   !url.endsWith('.odt');
                                                        });
                                                        setActiveGallery({ media: filtered, index: idx });
                                                    }}
                                                >
                                                    {m.media_type.startsWith('video') ? (
                                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                                            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.333-5.89a1.5 1.5 0 000-2.538L6.3 2.841z" /></svg>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <img src={m.file_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Incident Media" />
                                                    )}
                                                    {idx === 3 && viewingRequest.report!.media!.filter(m => {
                                                        const url = m.file_url.toLowerCase();
                                                        return m.media_type !== 'Document' && 
                                                               !url.endsWith('.pdf') && 
                                                               !url.endsWith('.doc') && 
                                                               !url.endsWith('.docx') && 
                                                               !url.endsWith('.txt') && 
                                                               !url.endsWith('.odt');
                                                    }).length > 4 && (
                                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                            <span className="text-white text-lg font-black">+{viewingRequest.report!.media!.filter(m => {
                                                                const url = m.file_url.toLowerCase();
                                                                return m.media_type !== 'Document' && 
                                                                       !url.endsWith('.pdf') && 
                                                                       !url.endsWith('.doc') && 
                                                                       !url.endsWith('.docx') && 
                                                                       !url.endsWith('.txt') && 
                                                                       !url.endsWith('.odt');
                                                            }).length - 4}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Location */}
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center gap-3 text-gray-500">
                                            <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{viewingRequest.report?.landmark}</p>
                                                <p className="text-[9px] text-gray-400 uppercase tracking-widest font-medium">Pinpoint Accuracy Verified</p>
                                            </div>
                                        </div>
                                        <div className="w-full h-[200px] rounded-[2rem] overflow-hidden border border-gray-100">
                                            <MapComponent
                                                center={[viewingRequest.report?.latitude || 14.8, viewingRequest.report?.longitude || 121.0]}
                                                zoom={17}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer - Actions */}
                        <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50 flex flex-col gap-4">
                            {viewingRequest.status_id === 1 ? (
                                <>
                                    <div className="flex gap-3">
                                        <Button
                                            variant="primary"
                                            className="flex-1 !bg-orange-600 hover:!bg-orange-700 !rounded-2xl py-4 flex flex-col items-center gap-1 shadow-lg shadow-orange-100"
                                            onClick={() => openStatusUpdate(viewingRequest.rescue_id, viewingRequest.report_id, 5)}
                                        >
                                            <span className="text-[11px] font-black uppercase tracking-widest">Approve & Dispatch Rescue Team</span>
                                            <span className="text-[9px] opacity-70 font-medium">Status will change to 'Team Dispatched'</span>
                                        </Button>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => openStatusUpdate(viewingRequest.rescue_id, viewingRequest.report_id, 3)}
                                            className="flex-1 py-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] hover:text-red-500 transition-colors"
                                        >
                                            Reject Request
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {[
                                        { id: 1, label: 'Reported', sub: 'Citizen Post' },
                                        { id: 4, label: 'Verified', sub: 'Forwarded' },
                                        { id: 5, label: 'Dispatched', sub: 'On the way' },
                                        { id: 7, label: 'Picked Up', sub: 'Animal secured' },
                                        { id: 9, label: 'Impounded', sub: 'At shelter' },
                                        { id: 6, label: 'Resolved', sub: 'Operation complete' }
                                    ].map((opt) => {
                                        const stages = [1, 4, 5, 7, 9, 6];
                                        const currentIndex = stages.indexOf(viewingRequest.report?.status_id);
                                        const optIndex = stages.indexOf(opt.id);
                                        const isCompleted = currentIndex >= optIndex;
                                        const isCurrent = viewingRequest.report?.status_id === opt.id;

                                        return (
                                            <button
                                                key={opt.id}
                                                onClick={() => openStatusUpdate(viewingRequest.rescue_id, viewingRequest.report_id, opt.id)}
                                                className={`p-4 rounded-2xl border transition-all group text-left relative overflow-hidden ${isCurrent ? 'bg-orange-50 border-orange-500 shadow-md ring-2 ring-orange-100' :
                                                        isCompleted ? 'bg-white border-green-100 hover:border-orange-500 hover:shadow-lg' :
                                                            'bg-white border-gray-100 hover:border-orange-500 hover:shadow-lg'
                                                    }`}
                                            >
                                                {isCompleted && (
                                                    <div className="absolute top-2 right-2">
                                                        <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                                                            <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                        </div>
                                                    </div>
                                                )}
                                                <p className={`text-[10px] font-black uppercase tracking-widest ${isCurrent ? 'text-orange-600' : 'text-gray-900 group-hover:text-orange-600'
                                                    }`}>
                                                    {opt.label}
                                                </p>
                                                <p className="text-[9px] text-gray-400 mt-0.5">{opt.sub}</p>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Status Update Modal */}
            {isStatusModalOpen && statusToUpdate && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="p-10">
                            <div className="w-16 h-16 rounded-[2rem] bg-orange-50 text-orange-600 flex items-center justify-center mb-8">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>

                            <h3 className="text-2xl font-black text-gray-900 mb-2">Update Rescue Status</h3>
                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">
                                New Status: <span className="text-orange-600">{statusMap[statusToUpdate.statusId] || reportStatusMap[statusToUpdate.statusId]}</span>
                            </p>

                            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100 mb-8">
                                <p className="text-xs font-bold text-gray-600 leading-relaxed">
                                    Please provide a brief message and real-time image or video evidence of the animal's current status and location.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Status Message / Title</label>
                                    <textarea
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all min-h-[100px] placeholder:text-gray-300"
                                        placeholder="e.g. Animal successfully rescued and transported to shelter..."
                                        value={statusUpdateMessage}
                                        onChange={(e) => setStatusUpdateMessage(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Animal Condition</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['Healthy', 'Injured', 'Aggressive', 'Thin', 'Nursing', 'Deceased'].map((cond) => (
                                            <button
                                                key={cond}
                                                onClick={() => setStatusUpdateCondition(cond)}
                                                className={`py-2.5 px-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${statusUpdateCondition === cond
                                                        ? 'bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-100'
                                                        : 'bg-white text-gray-400 border-gray-100 hover:border-orange-200'
                                                    }`}
                                            >
                                                {cond}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Add Evidence Photos/Videos</label>
                                    <div
                                        onClick={() => document.getElementById('status-media-upload')?.click()}
                                        className="w-full aspect-video rounded-[2rem] border-2 border-dashed border-gray-200 bg-white flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-orange-500 hover:bg-orange-50/10 transition-all group"
                                    >
                                        {statusMediaFiles.length > 0 ? (
                                            <div className="flex flex-col items-center">
                                                <span className="text-2xl font-black text-orange-600">{statusMediaFiles.length}</span>
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Files Selected</span>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 group-hover:text-orange-500 transition-colors">
                                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                                </div>
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tap to select multiple</p>
                                            </>
                                        )}
                                    </div>
                                    <input
                                        id="status-media-upload"
                                        type="file"
                                        multiple
                                        accept="image/*,video/*"
                                        className="hidden"
                                        onChange={(e) => setStatusMediaFiles(Array.from(e.target.files || []))}
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 mt-10">
                                <Button
                                    variant="primary"
                                    onClick={handleUpdateStatus}
                                    className="!bg-gray-900 hover:!bg-black !rounded-2xl py-4 !border-none"
                                    disabled={isUpdating}
                                >
                                    {isUpdating ? 'Uploading...' : 'Confirm Status Update'}
                                </Button>
                                <button
                                    onClick={() => {
                                        setIsStatusModalOpen(false);
                                        setStatusMediaFiles([]);
                                    }}
                                    className="py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Gallery Viewer */}
            {activeGallery && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-300">
                    <div className="p-8 flex justify-between items-center">
                        <div>
                            <p className="text-white font-black uppercase tracking-widest text-sm">Incident Documentation</p>
                            <p className="text-gray-500 text-[10px] uppercase tracking-widest mt-1">File {activeGallery.index + 1} of {activeGallery.media.length}</p>
                        </div>
                        <button
                            onClick={() => setActiveGallery(null)}
                            className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>

                    <div className="flex-1 relative flex items-center justify-center p-8">
                        {activeGallery.media[activeGallery.index].media_type.startsWith('video') ? (
                            <video
                                src={activeGallery.media[activeGallery.index].file_url}
                                controls
                                autoPlay
                                className="max-w-full max-h-full rounded-2xl shadow-2xl"
                            />
                        ) : (
                            <img
                                src={activeGallery.media[activeGallery.index].file_url}
                                className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl"
                            />
                        )}

                        {activeGallery.media.length > 1 && (
                            <>
                                <button
                                    onClick={() => setActiveGallery(prev => ({ ...prev!, index: (prev!.index - 1 + prev!.media.length) % prev!.media.length }))}
                                    className="absolute left-8 w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/10"
                                >
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                </button>
                                <button
                                    onClick={() => setActiveGallery(prev => ({ ...prev!, index: (prev!.index + 1) % prev!.media.length }))}
                                    className="absolute right-8 w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/10"
                                >
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BrgyRescueRequests;
