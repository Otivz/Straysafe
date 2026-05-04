import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import SubdSidebar from '../../components/SubdSidebar';
import SubdNavbar from '../../components/Navbars/SubdNavbar';
import Button from '../../components/Button';
import SuccessModal from '../../components/Modals/SuccessModal';
import Select from '../../components/Dropdown';
import MapComponent from '../../components/MapComponent';

interface Report {
    report_id: number;
    category_id: number;
    status_id: number;
    priority_level: string;
    latitude: number;
    longitude: number;
    landmark: string;
    animal_count: number;
    description: string;
    visibility: string;
    created_at: string;
    user_id: number;
    reporter_name?: string;
    media?: any[];
    comments?: any[];
}

const statusMap: Record<number, string> = {
    1: 'Pending', 2: 'Verified', 3: 'Rejected',
    4: 'Escalated to Barangay', 5: 'Rescue In Progress', 6: 'Resolved',
    7: 'Picked Up', 8: 'Under Observation', 9: 'Impounded'
};
const categoryMap: Record<number, string> = {
    1: 'Injured Animal', 2: 'Aggressive Stray', 3: 'Possible Rabies Risk',
    4: 'Roaming Pack', 5: 'Animal Rescue Needed'
};

const SubdReports = () => {
    const navigate = useNavigate();

    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [viewingReportId, setViewingReportId] = useState<number | null>(null);
    const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
    const [escalatingReportId, setEscalatingReportId] = useState<number | null>(null);
    const [endorsementFile, setEndorsementFile] = useState<File | null>(null);
    const [isEscalating, setIsEscalating] = useState(false);
    const [escalationTitle, setEscalationTitle] = useState('');
    const [escalationDescription, setEscalationDescription] = useState('');
    const menuRef = useRef<HTMLDivElement>(null);

    const userStr = localStorage.getItem('staff_user') || sessionStorage.getItem('staff_user');
    const currentUser = userStr ? JSON.parse(userStr) : null;
    const currentUserId = currentUser ? currentUser.user_id : 1;

    const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
    const [replyingTo, setReplyingTo] = useState<Record<number, { commentId: number, userName: string } | null>>({});
    const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({});

    useEffect(() => {
        if (!userStr) {
            navigate('/staff/login');
        } else {
            try {
                if (currentUser.role_id !== 2) {
                    navigate('/staff/login');
                }
            } catch {
                navigate('/staff/login');
            }
        }
    }, [navigate, userStr, currentUser]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const [formData, setFormData] = useState({
        category_id: 1,
        latitude: 14.8013,
        longitude: 121.0031,
        landmark: '',
        priority_level: 'Regular',
        description: ''
    });

    const API_URL = 'http://localhost:8000/reports';

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await axios.get(API_URL);
            setReports(response.data);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleAddComment = async (reportId: number) => {
        const text = commentInputs[reportId];
        if (!text || !text.trim()) return;

        try {
            const parentId = replyingTo[reportId]?.commentId || null;
            await axios.post(`${API_URL}/${reportId}/comments`, {
                message: text.trim(),
                user_id: currentUserId,
                parent_comment_id: parentId
            });

            setCommentInputs(prev => ({ ...prev, [reportId]: '' }));
            setReplyingTo(prev => ({ ...prev, [reportId]: null }));
            fetchReports(); // Refresh to get the latest comments
        } catch (error) {
            console.error('Error adding comment:', error);
            alert('Failed to post comment.');
        }
    };

    const handleUpdateStatus = async (id: number, newStatusId: number) => {
        try {
            await axios.patch(`${API_URL}/${id}/status`, { status_id: newStatusId });
            fetchReports();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status. Please try again.');
        }
    };

    const handleEscalate = async () => {
        if (!escalatingReportId || !endorsementFile) {
            alert('Please select an endorsement letter file.');
            return;
        }

        try {
            setIsEscalating(true);

            // 1. Upload the letter
            const formData = new FormData();
            formData.append('file', endorsementFile);
            await axios.post(`${API_URL}/${escalatingReportId}/media`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // 2. Update status to Escalated (4)
            await axios.patch(`${API_URL}/${escalatingReportId}/status`, { status_id: 4 });

            // 3. Create official Rescue Request record
            await axios.post('http://localhost:8000/rescue-requests/', {
                report_id: escalatingReportId,
                leader_id: currentUserId,
                title: escalationTitle,
                description: escalationDescription,
                status_id: 1 // Pending
            });

            setIsEscalateModalOpen(false);
            setEscalatingReportId(null);
            setEndorsementFile(null);
            setEscalationTitle('');
            setEscalationDescription('');
            setShowSuccess(true);
            fetchReports();
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error('Error escalating report:', error);
            alert('Failed to escalate report. Please try again.');
        } finally {
            setIsEscalating(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this incident report?')) {
            try {
                await axios.delete(`${API_URL}/${id}`);
                fetchReports();
            } catch (error) {
                console.error('Error deleting report:', error);
            }
        }
    };

    const handleSaveReport = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (!currentUser) throw new Error('User not authenticated');

            await axios.post(API_URL, {
                ...formData,
                user_id: currentUser.user_id,
                subdivision_id: currentUser.subdivision_id || 1,
                animal_count: 1,
                visibility: 'Public',
                status_id: 1,
                is_archived: false
            });

            setIsModalOpen(false);
            setShowSuccess(true);
            setFormData({
                category_id: 1,
                latitude: 14.8013,
                longitude: 121.0031,
                landmark: '',
                priority_level: 'Regular',
                description: ''
            });
            fetchReports();
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error('Error saving report:', error);
            alert('Failed to submit report. Please try again.');
        }
    };

    const filteredReports = reports.filter(rep => {
        const catName = categoryMap[rep.category_id]?.toLowerCase() || '';
        const land = (rep.landmark || '').toLowerCase();
        const reporter = (rep.reporter_name || '').toLowerCase();
        const matchesSearch = catName.includes(searchTerm.toLowerCase()) || land.includes(searchTerm.toLowerCase()) || reporter.includes(searchTerm.toLowerCase());
        const statName = statusMap[rep.status_id] || '';
        const matchesStatus = statusFilter === 'all' || statName.toLowerCase() === statusFilter.toLowerCase();
        // optionally filter by subdId: if (rep.subdivision_id !== currentUser?.subdivision_id) return false;
        return matchesSearch && matchesStatus;
    });

    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'emergency':
            case 'high': return 'bg-red-50 text-red-600 border-red-100';
            case 'regular':
            case 'medium': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'low': return 'bg-blue-50 text-blue-600 border-blue-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending verification':
            case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'in action':
            case 'ongoing': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'resolved': return 'bg-green-50 text-green-600 border-green-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    return (
        <div className="flex h-screen bg-[#F8FAFC]">
            <SubdSidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                {/* TOP NAVIGATION */}
                <SubdNavbar />

                <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="max-w-7xl mx-auto">
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Community Incident Reports</h1>
                                <p className="text-gray-500 text-sm mt-1">Monitor and manage reported animal incidents in your subdivision.</p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <Button variant="light" className="flex items-center space-x-2" onClick={fetchReports}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    <span>Refresh</span>
                                </Button>
                                <Button variant="primary" className="flex items-center space-x-2 px-6 !bg-[#F97316] hover:!bg-[#EA580C] !border-[#F97316]" onClick={() => setIsModalOpen(true)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                    <span>Report Incident</span>
                                </Button>
                            </div>
                        </div>

                        {/* Search & Filters */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="relative flex-1 max-w-md">
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </span>
                                <input
                                    type="text"
                                    placeholder="Search by category or landmark..."
                                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#F97316] outline-none transition-all"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    options={[
                                        { value: 'all', label: 'All Status' },
                                        { value: 'Pending', label: 'Pending' },
                                        { value: 'Ongoing', label: 'Ongoing' },
                                        { value: 'Resolved', label: 'Resolved' }
                                    ]}
                                    className="w-[140px]"
                                />
                            </div>
                        </div>

                        {/* Table */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-visible">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100">
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest rounded-tl-2xl">ID</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Category</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Priority</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Location</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Rescue Status</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Submitted By</th>
                                        <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right rounded-tr-2xl">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 text-gray-700">
                                    {loading ? (
                                        <tr><td colSpan={8} className="px-6 py-10 text-center text-gray-500">Loading reports...</td></tr>
                                    ) : filteredReports.length === 0 ? (
                                        <tr><td colSpan={8} className="px-6 py-10 text-center text-gray-500">No incident reports found.</td></tr>
                                    ) : filteredReports.map((rep) => (
                                        <tr key={rep.report_id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 text-xs font-mono text-gray-400">
                                                #{rep.report_id.toString().padStart(4, '0')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    <span className="w-2 h-2 rounded-full bg-[#F97316]"></span>
                                                    <span className="text-sm font-bold text-gray-900">{categoryMap[rep.category_id] || 'Other'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getPriorityColor(rep.priority_level)}`}>
                                                    {rep.priority_level}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-1.5 text-gray-500">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <span className="text-xs truncate max-w-[150px]">{rep.landmark || 'No landmark'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    {rep.status_id >= 5 ? (
                                                        <>
                                                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                                            <span className="text-xs font-bold text-blue-700">{statusMap[rep.status_id]}</span>
                                                        </>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">Not started</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(statusMap[rep.status_id] || 'Pending')}`}>
                                                    {statusMap[rep.status_id] || 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-500 font-bold border border-gray-200">
                                                        {(rep.reporter_name || 'U').charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="text-xs font-semibold text-gray-700">{rep.reporter_name || `User ${rep.user_id}`}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="relative inline-block text-left" ref={openMenuId === rep.report_id ? menuRef : null}>
                                                    <button
                                                        onClick={() => setOpenMenuId(openMenuId === rep.report_id ? null : rep.report_id)}
                                                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                                                        </svg>
                                                    </button>

                                                    {openMenuId === rep.report_id && (
                                                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                                                            <button
                                                                onClick={() => {
                                                                    setViewingReportId(rep.report_id);
                                                                    setOpenMenuId(null);
                                                                }}
                                                                className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                                View Report
                                                            </button>
                                                            {rep.status_id !== 6 && (
                                                                <button
                                                                    onClick={() => {
                                                                        handleUpdateStatus(rep.report_id, 6);
                                                                        setOpenMenuId(null);
                                                                    }}
                                                                    className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-green-600 hover:bg-green-50 transition-colors"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                                    </svg>
                                                                    Mark Resolved
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => {
                                                                    handleDelete(rep.report_id);
                                                                    setOpenMenuId(null);
                                                                }}
                                                                className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                                Delete Report
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>

            {/* View Report Modal */}
            {viewingReportId !== null && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Incident Report Details</h3>
                                <p className="text-xs text-gray-500 mt-1">Full view of the resident's report</p>
                            </div>
                            <button onClick={() => setViewingReportId(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
                            {(() => {
                                const viewReport = reports.find(r => r.report_id === viewingReportId);
                                if (!viewReport) return null;
                                return (
                                    <div className="space-y-8">
                                        {/* Header Info */}
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-lg text-gray-500 font-bold border border-gray-200">
                                                    {(viewReport.reporter_name || 'U').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-bold text-gray-900">{viewReport.reporter_name || `User ${viewReport.user_id}`}</h4>
                                                    <p className="text-xs text-gray-500">{new Date(viewReport.created_at).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(statusMap[viewReport.status_id] || 'Pending')}`}>
                                                    {statusMap[viewReport.status_id] || 'Pending'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Details Grid */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                            <div>
                                                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Category</span>
                                                <span className="text-sm font-semibold text-gray-900">{categoryMap[viewReport.category_id] || 'Other'}</span>
                                            </div>
                                            <div>
                                                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Priority</span>
                                                <span className={`text-sm font-bold ${getPriorityColor(viewReport.priority_level).replace('bg-', 'text-').replace('-50', '-600')}`}>
                                                    {viewReport.priority_level}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Rescue Status</span>
                                                <span className={`text-sm font-bold ${viewReport.status_id >= 5 ? 'text-blue-600' : 'text-gray-400'}`}>
                                                    {viewReport.status_id >= 5 ? statusMap[viewReport.status_id] : 'Not Yet Initiated'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Animals</span>
                                                <span className="text-sm font-semibold text-gray-900">{viewReport.animal_count} observed</span>
                                            </div>
                                            <div>
                                                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Landmark</span>
                                                <span className="text-sm font-semibold text-gray-900">{viewReport.landmark || 'N/A'}</span>
                                            </div>
                                            <div>
                                                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Coordinates</span>
                                                <span className="text-xs font-mono text-gray-600">{viewReport.latitude}, {viewReport.longitude}</span>
                                            </div>
                                        </div>

                                        {/* Map Location */}
                                        <div>
                                            <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Incident Location Map</h5>
                                            <div className="w-full h-64 rounded-2xl overflow-hidden border border-gray-100 shadow-sm bg-gray-50">
                                                <MapComponent
                                                    center={[viewReport.latitude, viewReport.longitude]}
                                                    zoom={17}
                                                    showHeatmap={false}
                                                />
                                            </div>
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Description</h5>
                                            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                                                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{viewReport.description || 'No description provided.'}</p>
                                            </div>
                                        </div>

                                        {/* Media */}
                                        {viewReport.media && viewReport.media.length > 0 && (
                                            <div>
                                                <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Attached Media</h5>
                                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                                    {viewReport.media.map((m: any) => (
                                                        <div key={m.media_id} className="flex flex-col gap-2">
                                                            <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                                                                {m.media_type === 'Video' ? (
                                                                    <video src={m.file_url} className="w-full h-full object-cover" />
                                                                ) : m.media_type === 'Document' ? (
                                                                    <div className="w-full h-full flex flex-col items-center justify-center bg-orange-50 text-[#F97316] p-4 gap-2">
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                        </svg>
                                                                        <span className="text-[8px] font-bold uppercase tracking-widest text-center">Document</span>
                                                                    </div>
                                                                ) : (
                                                                    <img src={m.file_url} alt="Report media" className="w-full h-full object-cover" />
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

                                                                    return (
                                                                        <>
                                                                            <a
                                                                                href={viewUrl}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="flex-1 py-1.5 bg-white border border-gray-200 rounded-lg text-[9px] font-bold text-gray-600 hover:bg-gray-50 transition-all text-center"
                                                                            >
                                                                                View
                                                                            </a>
                                                                            <a
                                                                                href={m.file_url.replace('/upload/', `/upload/fl_attachment:StraySafe_Media_${m.media_id}/`)}
                                                                                className="flex-1 py-1.5 bg-orange-50 border border-orange-100 rounded-lg text-[9px] font-bold text-[#F97316] hover:bg-orange-100 transition-all text-center"
                                                                            >
                                                                                Download
                                                                            </a>
                                                                        </>
                                                                    );
                                                                })()}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* AI Insights & Data Assessment */}
                                        <div className="bg-orange-50/50 rounded-2xl p-6 border border-orange-100/50">
                                            <h5 className="text-[11px] font-bold text-[#F97316] uppercase tracking-widest mb-4 flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                                AI Insights & Data Assessment
                                            </h5>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div className="bg-white p-4 rounded-xl shadow-sm border border-orange-100">
                                                    <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Area Risk Level</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                                        <span className="text-sm font-bold text-gray-900">High Risk Hotspot</span>
                                                    </div>
                                                </div>
                                                <div className="bg-white p-4 rounded-xl shadow-sm border border-orange-100">
                                                    <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Duplicate Check</span>
                                                    <div className="flex items-center gap-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <span className="text-sm font-bold text-gray-900">Unique Report</span>
                                                    </div>
                                                </div>
                                                <div className="bg-white p-4 rounded-xl shadow-sm border border-orange-100">
                                                    <span className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">AI Classification</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="px-2 py-0.5 bg-orange-100 text-[#F97316] text-[10px] font-bold rounded-md">Dog</span>
                                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-bold rounded-md">Injured</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Comments Section */}
                                        <div className="bg-white border border-gray-100 rounded-2xl p-6 pt-5 shadow-sm">
                                            {viewReport.comments && viewReport.comments.length > 0 && (
                                                <button
                                                    onClick={() => setExpandedComments(prev => ({ ...prev, [viewReport.report_id]: !prev[viewReport.report_id] }))}
                                                    className="text-[10px] font-black text-gray-400 hover:text-[#F97316] uppercase tracking-widest transition-colors flex items-center gap-2 mb-6"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-300 ${expandedComments[viewReport.report_id] ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                    {expandedComments[viewReport.report_id] ? 'Hide Comments' : `View all ${viewReport.comments.length} comments`}
                                                </button>
                                            )}

                                            {(expandedComments[viewReport.report_id] || !viewReport.comments || viewReport.comments.length === 0) && (
                                                <div className="space-y-2 mb-6 max-h-72 overflow-y-auto custom-scrollbar pr-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                                    {viewReport.comments && viewReport.comments.length > 0 ? (
                                                        viewReport.comments.filter((c: any) => !c.parent_comment_id).map((c: any) => {
                                                            const replies = viewReport.comments?.filter((reply: any) => reply.parent_comment_id === c.comment_id) || [];
                                                            return (
                                                                <div key={c.comment_id} className="mb-4 last:mb-0">
                                                                    <div className="flex gap-3 relative">
                                                                        {/* Parent Avatar & Vertical Line */}
                                                                        <div className="relative flex flex-col items-center shrink-0">
                                                                            <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-[#F97316] font-black text-xs z-10 ring-4 ring-white border border-orange-100">
                                                                                {c.user_name?.charAt(0).toUpperCase() || 'U'}
                                                                            </div>
                                                                            {(replies.length > 0 || replyingTo[viewReport.report_id]?.commentId === c.comment_id) && (
                                                                                <div className="absolute top-8 bottom-[-16px] left-1/2 -translate-x-1/2 w-[2px] bg-gray-100 z-0"></div>
                                                                            )}
                                                                        </div>

                                                                        <div className="flex-1 pb-1">
                                                                            {/* Parent Bubble */}
                                                                            <div className="bg-[#FAFAF9] rounded-[1.5rem] p-3.5 px-4 border border-gray-50 shadow-sm inline-block">
                                                                                <span className="block text-[11px] font-black text-[#1a1208] mb-0.5">{c.user_name || 'User'}</span>
                                                                                <p className="text-xs font-semibold text-gray-700 leading-relaxed pr-6">{c.message}</p>
                                                                            </div>
                                                                            {/* Parent Actions */}
                                                                            <div className="flex items-center gap-4 mt-1.5 ml-3">
                                                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{new Date(c.created_at).toLocaleDateString()}</span>
                                                                                <button
                                                                                    onClick={() => setReplyingTo(prev => ({ ...prev, [viewReport.report_id]: { commentId: c.comment_id, userName: c.user_name || 'User' } }))}
                                                                                    className="text-[10px] font-bold text-gray-500 hover:text-[#F97316] transition-colors"
                                                                                >
                                                                                    Reply
                                                                                </button>
                                                                            </div>

                                                                            {/* Replies Container */}
                                                                            {replies.length > 0 && (
                                                                                <div className="mt-4 space-y-4">
                                                                                    {replies.map((reply: any, index: number) => (
                                                                                        <div key={reply.comment_id} className="flex gap-3 relative">
                                                                                            {/* Horizontal connector curve */}
                                                                                            <div className="absolute top-[-10px] left-[-28px] w-[28px] h-[26px] border-b-[2px] border-l-[2px] border-gray-100 rounded-bl-[12px] z-0 pointer-events-none"></div>

                                                                                            {/* Mask to hide vertical line below the last reply */}
                                                                                            {index === replies.length - 1 && replyingTo[viewReport.report_id]?.commentId !== c.comment_id && (
                                                                                                <div className="absolute top-[16px] bottom-[-100px] left-[-30px] w-[6px] bg-white z-0 pointer-events-none"></div>
                                                                                            )}

                                                                                            {/* Child Avatar */}
                                                                                            <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 font-bold text-[10px] z-10 mt-1 ring-4 ring-white border border-gray-100 shrink-0">
                                                                                                {reply.user_name?.charAt(0).toUpperCase() || 'U'}
                                                                                            </div>

                                                                                            <div className="flex-1">
                                                                                                {/* Child Bubble */}
                                                                                                <div className="bg-[#FAFAF9] rounded-[1.2rem] p-3 px-4 border border-gray-50 shadow-sm inline-block">
                                                                                                    <span className="block text-[10px] font-black text-gray-800 mb-0.5">{reply.user_name || 'User'}</span>
                                                                                                    <p className="text-[11px] font-semibold text-gray-600 leading-relaxed pr-4">{reply.message}</p>
                                                                                                </div>
                                                                                                {/* Child Actions */}
                                                                                                <div className="flex items-center gap-4 mt-1.5 ml-3">
                                                                                                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{new Date(reply.created_at).toLocaleDateString()}</span>
                                                                                                    <button
                                                                                                        onClick={() => setReplyingTo(prev => ({ ...prev, [viewReport.report_id]: { commentId: c.comment_id, userName: reply.user_name || 'User' } }))}
                                                                                                        className="text-[9px] font-bold text-gray-500 hover:text-[#F97316] transition-colors"
                                                                                                    >
                                                                                                        Reply
                                                                                                    </button>
                                                                                                </div>
                                                                                            </div>
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            )}

                                                                            {/* Inline Reply Input */}
                                                                            {replyingTo[viewReport.report_id]?.commentId === c.comment_id && (
                                                                                <div className="mt-4 flex items-center gap-3 relative z-10 animate-in fade-in slide-in-from-top-2 duration-200">
                                                                                    <div className="absolute top-[-10px] left-[-28px] w-[28px] h-[24px] border-b-[2px] border-l-[2px] border-gray-100 rounded-bl-[12px] z-0 pointer-events-none"></div>
                                                                                    <div className="absolute top-[14px] bottom-[-100px] left-[-30px] w-[6px] bg-white z-0 pointer-events-none"></div>

                                                                                    <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-[#F97316] font-black text-[10px] shrink-0 border border-orange-200 z-10 bg-white ring-4 ring-white">
                                                                                        {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'S'}
                                                                                    </div>
                                                                                    <div className="flex-1 relative flex items-center">
                                                                                        <input
                                                                                            type="text"
                                                                                            autoFocus
                                                                                            placeholder={`Replying to ${replyingTo[viewReport.report_id]?.userName}...`}
                                                                                            className="w-full bg-[#FAFAF9] border border-gray-100 rounded-[1.2rem] pl-4 pr-10 py-2 text-[11px] font-semibold text-[#1a1208] focus:outline-none focus:border-orange-200 focus:bg-white transition-all placeholder:text-gray-400 shadow-inner"
                                                                                            value={commentInputs[viewReport.report_id] || ''}
                                                                                            onChange={(e) => setCommentInputs(prev => ({ ...prev, [viewReport.report_id]: e.target.value }))}
                                                                                            onKeyPress={(e) => e.key === 'Enter' && handleAddComment(viewReport.report_id)}
                                                                                        />
                                                                                        <button
                                                                                            onClick={() => {
                                                                                                setReplyingTo(prev => ({ ...prev, [viewReport.report_id]: null }));
                                                                                                setCommentInputs(prev => ({ ...prev, [viewReport.report_id]: '' }));
                                                                                            }}
                                                                                            className="absolute right-3 text-gray-400 hover:text-red-500 transition-colors"
                                                                                        >
                                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                                                                            </svg>
                                                                                        </button>
                                                                                    </div>
                                                                                    <button
                                                                                        onClick={() => handleAddComment(viewReport.report_id)}
                                                                                        className="bg-[#F97316] text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md shadow-orange-100 hover:scale-105 active:scale-95 transition-all shrink-0"
                                                                                    >
                                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 relative left-[1px]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                                                        </svg>
                                                                                    </button>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    ) : (
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic text-center py-4">No comments yet. Be the first to comment!</p>
                                                    )}
                                                </div>
                                            )}

                                            {!replyingTo[viewReport.report_id] && (
                                                <div className="flex items-center gap-3 animate-in fade-in duration-200 border-t border-gray-50 pt-4 mt-2">
                                                    <div className="flex-1 relative">
                                                        <input
                                                            type="text"
                                                            placeholder="Write a comment as Subdivision Leader..."
                                                            className="w-full bg-[#FAFAF9] border border-gray-100 rounded-[1.5rem] pl-5 pr-12 py-3 text-xs font-semibold text-[#1a1208] focus:outline-none focus:border-orange-200 focus:bg-white transition-all placeholder:text-gray-300 shadow-inner"
                                                            value={commentInputs[viewReport.report_id] || ''}
                                                            onChange={(e) => setCommentInputs(prev => ({ ...prev, [viewReport.report_id]: e.target.value }))}
                                                            onKeyPress={(e) => e.key === 'Enter' && handleAddComment(viewReport.report_id)}
                                                        />
                                                    </div>
                                                    <button
                                                        onClick={() => handleAddComment(viewReport.report_id)}
                                                        className="bg-[#F97316] text-white rounded-[1.2rem] p-3 shadow-md shadow-orange-100 hover:scale-105 active:scale-95 transition-all flex-shrink-0"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* ACTION PANEL */}
                                        <div className="mt-8 pt-8 border-t border-gray-100">
                                            <div className="flex flex-col gap-3">
                                                {viewReport.status_id < 4 && (
                                                    <button
                                                        onClick={() => {
                                                            setEscalatingReportId(viewReport.report_id);
                                                            setIsEscalateModalOpen(true);
                                                            setViewingReportId(null);
                                                        }}
                                                        className="w-full py-4 bg-orange-600 text-white rounded-2xl text-xs font-bold shadow-lg shadow-orange-100 hover:bg-orange-700 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                                        </svg>
                                                        ESCALATE TO BARANGAY FOR RESCUE
                                                    </button>
                                                )}

                                                {viewReport.status_id !== 6 && (
                                                    <button
                                                        onClick={() => {
                                                            handleUpdateStatus(viewReport.report_id, 6);
                                                            setViewingReportId(null);
                                                        }}
                                                        className="w-full py-3 border border-gray-100 rounded-2xl text-[10px] font-bold text-gray-400 hover:bg-green-50 hover:text-green-600 hover:border-green-100 transition-all uppercase tracking-widest"
                                                    >
                                                        Mark as Resolved
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => {
                                                        handleDelete(viewReport.report_id);
                                                        setViewingReportId(null);
                                                    }}
                                                    className="w-full py-3 border border-gray-100 rounded-2xl text-[10px] font-bold text-gray-400 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all uppercase tracking-widest"
                                                >
                                                    Delete Report
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Report New Incident</h3>
                                <p className="text-xs text-gray-500 mt-1">Provide details about the stray or animal incident observed.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSaveReport} className="p-8 max-h-[75vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Select
                                    label="Category"
                                    value={formData.category_id.toString()}
                                    onChange={(e) => setFormData({ ...formData, category_id: parseInt(e.target.value) })}
                                    options={[
                                        { value: '1', label: 'Injured Animal' },
                                        { value: '2', label: 'Aggressive Stray' },
                                        { value: '3', label: 'Possible Rabies Risk' },
                                        { value: '4', label: 'Roaming Pack' },
                                        { value: '5', label: 'Animal Rescue Needed' }
                                    ]}
                                />
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Landmark</label>
                                    <input
                                        type="text" required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#F97316] outline-none transition-all"
                                        value={formData.landmark}
                                        onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                                        placeholder="e.g. Near Clubhouse"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Latitude</label>
                                    <input
                                        type="number" step="any" required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#F97316] outline-none transition-all"
                                        value={formData.latitude}
                                        onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Longitude</label>
                                    <input
                                        type="number" step="any" required
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#F97316] outline-none transition-all"
                                        value={formData.longitude}
                                        onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                                    />
                                </div>
                                <Select
                                    label="Priority Level"
                                    value={formData.priority_level}
                                    onChange={(e) => setFormData({ ...formData, priority_level: e.target.value })}
                                    options={[
                                        { value: 'Low', label: 'Low' },
                                        { value: 'Regular', label: 'Regular' },
                                        { value: 'High', label: 'High' },
                                        { value: 'Emergency', label: 'Emergency' }
                                    ]}
                                />
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Description</label>
                                    <textarea
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#F97316] outline-none transition-all min-h-[100px]"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Provide any extra information that might help responders..."
                                    />
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <Button variant="primary" type="submit" className="px-10 !bg-[#F97316] hover:!bg-[#EA580C] !border-[#F97316]">
                                    Submit Report
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Escalate to Barangay Modal */}
            {isEscalateModalOpen && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Escalate to Barangay</h3>
                                <p className="text-xs text-gray-500 mt-1">Upload the endorsement letter to proceed.</p>
                            </div>
                            <button onClick={() => setIsEscalateModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Escalation Title</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Endorsement for Rescue Team"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#F97316] outline-none transition-all"
                                        value={escalationTitle}
                                        onChange={(e) => setEscalationTitle(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Brief Description</label>
                                    <textarea
                                        placeholder="Provide a summary of why this is being escalated..."
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-[#F97316] outline-none transition-all min-h-[100px]"
                                        value={escalationDescription}
                                        onChange={(e) => setEscalationDescription(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Endorsement Letter (PDF/JPG/PNG)</label>
                                    <div
                                        className={`relative border-2 border-dashed rounded-2xl p-8 transition-all flex flex-col items-center justify-center gap-3 ${endorsementFile ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300 bg-gray-50'}`}
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            if (e.dataTransfer.files?.[0]) setEndorsementFile(e.dataTransfer.files[0]);
                                        }}
                                    >
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            onChange={(e) => {
                                                if (e.target.files?.[0]) setEndorsementFile(e.target.files[0]);
                                            }}
                                        />
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${endorsementFile ? 'bg-orange-500 text-white' : 'bg-white text-gray-400 shadow-sm'}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-bold text-gray-900">{endorsementFile ? endorsementFile.name : 'Select or drag file'}</p>
                                            <p className="text-xs text-gray-500 mt-1">{endorsementFile ? `${(endorsementFile.size / 1024).toFixed(1)} KB` : 'PDF, PNG or JPG'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4">
                                <button
                                    onClick={() => setIsEscalateModalOpen(false)}
                                    className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <Button
                                    variant="primary"
                                    onClick={handleEscalate}
                                    disabled={!endorsementFile || isEscalating}
                                    className="px-10 !bg-[#F97316] hover:!bg-[#EA580C] !border-[#F97316]"
                                >
                                    {isEscalating ? 'Escalating...' : 'Submit Escalation'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <SuccessModal
                isOpen={showSuccess}
                message="Action completed successfully!"
            />
        </div>
    );
};

export default SubdReports;
