import { useState, useEffect, useRef } from 'react';
import Button from '../../components/Button';
import ResiNavbar from '../../components/Navbars/ResiNavbar';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon issue in React Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIconRetina,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom component to handle map clicks and move marker
const LocationPicker = ({ onLocationSelect, position }: { onLocationSelect: (lat: number, lng: number) => void, position: [number, number] }) => {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });

    return position ? <Marker position={position} /> : null;
};

const ResiHomePage = () => {
    const [isAddReportModalOpen, setIsAddReportModalOpen] = useState(false);
    const [reports, setReports] = useState<any[]>([]);

    const userStr = localStorage.getItem('resident_user');
    const currentUser = userStr ? JSON.parse(userStr) : null;
    const currentUserId = currentUser ? currentUser.user_id : null;

    const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
    const [replyingTo, setReplyingTo] = useState<Record<number, { commentId: number, userName: string } | null>>({});
    const [expandedComments, setExpandedComments] = useState<Record<number, boolean>>({});

    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [editingReportId, setEditingReportId] = useState<number | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDeleteReport = async (reportId: number) => {
        if (!window.confirm('Are you sure you want to delete this report?')) return;
        try {
            const response = await fetch(`http://localhost:8000/reports/${reportId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                alert('Report deleted successfully');
                fetchReports();
            } else {
                alert('Failed to delete report');
            }
        } catch (error) {
            console.error('Error deleting report:', error);
            alert('An error occurred while connecting to the server.');
        }
    };

    const handleEditClick = (report: any) => {
        setFormData({
            ...formData,
            category: report.category_id === 1 ? 'Dog' : 'Cat',
            animalCount: report.animal_count || 1,
            landmark: report.landmark || '',
            visibility: report.visibility || 'Public',
            description: report.description || '',
            latitude: parseFloat(report.latitude) || 14.801313,
            longitude: parseFloat(report.longitude) || 121.003109,
            breed: '',
            condition: 'Healthy',
            behaviorTags: [],
            image: null,
            video: null
        });
        setEditingReportId(report.report_id);
        setIsAddReportModalOpen(true);
        setOpenMenuId(null);
    };

    const fetchReports = async () => {
        try {
            const response = await fetch('http://localhost:8000/reports/');
            if (response.ok) {
                const data = await response.json();

                // Filter out Private reports that do not belong to the current user
                const visibleReports = data.filter((report: any) => {
                    return report.visibility === 'Public' || report.user_id === currentUserId;
                });

                setReports(visibleReports.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
            }
        } catch (error) {
            console.error('Failed to fetch reports:', error);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleAddComment = async (reportId: number) => {
        const text = commentInputs[reportId];
        if (!text || !text.trim()) return;

        try {
            const userId = currentUserId || 1; // Default to 1 if not logged in
            const parentId = replyingTo[reportId]?.commentId || null;

            const response = await fetch(`http://localhost:8000/reports/${reportId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text.trim(), user_id: userId, parent_comment_id: parentId })
            });

            if (response.ok) {
                setCommentInputs(prev => ({ ...prev, [reportId]: '' }));
                setReplyingTo(prev => ({ ...prev, [reportId]: null }));
                fetchReports(); // Refresh comments
            } else {
                alert('Failed to post comment.');
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    // Form state aligned with reports table
    const [formData, setFormData] = useState({
        category: 'Dog',
        breed: '',
        condition: 'Healthy', // New field
        animalCount: 1,       // Changed to number for stepper
        landmark: '',         // New field
        behaviorTags: [] as string[], // New field
        visibility: 'Public', // New field
        description: '',
        latitude: 14.801313,
        longitude: 121.003109,
        image: null as File | null,
        video: null as File | null
    });

    const handleSubmit = async () => {
        try {
            // Get user_id from localStorage if available, otherwise default to 1
            const userStr = localStorage.getItem('resident_user');
            const userId = userStr ? JSON.parse(userStr).user_id : 1;

            // Mapping frontend state to reports table schema
            const payload = {
                user_id: userId,
                subdivision_id: 1, // Hardcoded for demo/MVP
                category_id: formData.category === 'Dog' ? 1 : 2, // Simple mapping for now
                description: formData.description || 'No description provided.',
                latitude: formData.latitude,
                longitude: formData.longitude,
                animal_count: formData.animalCount,
                landmark: formData.landmark || '',
                priority_level: "Regular",
                visibility: formData.visibility,
                status_id: 1, // Pending Verification
                is_archived: false
            };

            const isEditing = editingReportId !== null;
            const url = isEditing
                ? `http://localhost:8000/reports/${editingReportId}`
                : 'http://localhost:8000/reports/';

            const method = isEditing ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const resultData = await response.json();
                const actualReportId = isEditing ? editingReportId : resultData.report_id;

                // Upload media if present
                if (formData.image || formData.video) {
                    const mediaFile = formData.image || formData.video;
                    const mediaData = new FormData();
                    mediaData.append("file", mediaFile!);

                    try {
                        await fetch(`http://localhost:8000/reports/${actualReportId}/media`, {
                            method: 'POST',
                            body: mediaData
                        });
                    } catch (err) {
                        console.error('Failed to upload media:', err);
                    }
                }

                alert(isEditing ? 'Report updated successfully!' : 'Report submitted successfully!');
                setIsAddReportModalOpen(false);
                setEditingReportId(null);
                fetchReports(); // Refresh the feed
                // Reset form to defaults
                setFormData({
                    ...formData,
                    breed: '',
                    landmark: '',
                    behaviorTags: [],
                    visibility: 'Public',
                    description: '',
                    image: null,
                    video: null
                });
            } else {
                const errorData = await response.json();
                alert(`Failed to ${isEditing ? 'update' : 'submit'} report: ${errorData.detail || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error submitting report:', error);
            alert('An error occurred while connecting to the server.');
        }
    };

    return (
        <div className="min-h-screen bg-[#FAFAF9] font-sans">
            <ResiNavbar />

            <main className="max-w-6xl mx-auto p-8 pt-28">

                {/* Top Actions */}
                <div className="flex justify-end items-center mb-10">
                    <Button
                        variant="primary"
                        onClick={() => {
                            setEditingReportId(null);
                            setFormData({
                                ...formData,
                                category: 'Dog',
                                breed: '',
                                condition: 'Healthy',
                                animalCount: 1,
                                landmark: '',
                                behaviorTags: [],
                                visibility: 'Public',
                                description: '',
                                latitude: 14.801313,
                                longitude: 121.003109,
                                image: null,
                                video: null
                            });
                            setIsAddReportModalOpen(true);
                        }}
                        className="bg-[#F97316] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-orange-200 hover:scale-105 transition-all flex items-center gap-3"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Report
                    </Button>
                </div>

                {/* Add Report Modal */}
                {isAddReportModalOpen && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-[#1a1208]/60 backdrop-blur-md animate-in fade-in duration-300"
                            onClick={() => setIsAddReportModalOpen(false)}
                        />

                        {/* Modal Content */}
                        <div className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500">
                            {/* Modal Header */}
                            <div className="px-10 pt-10 pb-6 flex justify-between items-center border-b border-gray-50">
                                <div>
                                    <h2 className="text-3xl font-black text-[#1a1208] uppercase tracking-tight">{editingReportId ? 'Edit Report' : 'Report a Stray'}</h2>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Fill up the details below to help our team</p>
                                </div>
                                <button
                                    onClick={() => setIsAddReportModalOpen(false)}
                                    className="p-3 bg-gray-50 text-gray-400 hover:text-[#1a1208] rounded-2xl transition-all"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                {/* Category & Breed */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                                    <div className="flex flex-col">
                                        <label className="text-[11px] font-black text-[#1a1208] uppercase tracking-widest mb-4">Select Animal Category</label>
                                        <div className="flex items-center gap-8 h-12 md:h-[50px]">
                                            {['Dog', 'Cat'].map((cat) => (
                                                <label
                                                    key={cat}
                                                    className="flex items-center gap-3 cursor-pointer group"
                                                >
                                                    <div className="relative flex items-center justify-center">
                                                        <input
                                                            type="radio"
                                                            name="category"
                                                            className="peer appearance-none w-5 h-5 rounded-full border-2 border-gray-200 checked:border-[#F97316] transition-all cursor-pointer"
                                                            checked={formData.category === cat}
                                                            onChange={() => setFormData({ ...formData, category: cat })}
                                                        />
                                                        <div className="absolute w-2.5 h-2.5 rounded-full bg-[#F97316] scale-0 peer-checked:scale-100 transition-transform duration-200" />
                                                    </div>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${formData.category === cat ? 'text-[#1a1208]' : 'text-gray-400 group-hover:text-gray-600'}`}>
                                                        {cat}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex flex-col">
                                        <label className="text-[11px] font-black text-[#1a1208] uppercase tracking-widest mb-4">Breed (Optional)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Aspin, Golden Retriever"
                                            className="w-full h-12 md:h-[50px] bg-[#FAFAF9] border border-gray-50 rounded-2xl px-6 text-xs font-bold text-[#1a1208] focus:outline-none focus:border-orange-200 transition-all placeholder:text-gray-300 shadow-sm"
                                            value={formData.breed}
                                            onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Condition Selection */}
                                <div>
                                    <label className="text-[11px] font-black text-[#1a1208] uppercase tracking-widest mb-4 block">Animal Condition</label>
                                    <div className="flex flex-wrap gap-3">
                                        {['Healthy', 'Injured', 'Aggressive', 'Thin'].map((cond) => (
                                            <button
                                                key={cond}
                                                onClick={() => setFormData({ ...formData, condition: cond })}
                                                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${formData.condition === cond
                                                    ? 'bg-[#F97316] text-white border-[#F97316] shadow-lg shadow-orange-100'
                                                    : 'bg-white text-gray-400 border-gray-100 hover:border-orange-100'
                                                    }`}
                                            >
                                                {cond}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Number of Animals */}
                                <div>
                                    <label className="text-[11px] font-black text-[#1a1208] uppercase tracking-widest mb-4 block">Number of Animals</label>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100 shadow-inner">
                                            <button
                                                onClick={() => setFormData({ ...formData, animalCount: Math.max(1, formData.animalCount - 1) })}
                                                className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-[#F97316] hover:bg-orange-50 transition-all active:scale-90"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                                                </svg>
                                            </button>
                                            <div className="w-10 text-center text-sm font-black text-[#1a1208]">
                                                {formData.animalCount}
                                            </div>
                                            <button
                                                onClick={() => setFormData({ ...formData, animalCount: formData.animalCount + 1 })}
                                                className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-[#F97316] hover:bg-orange-50 transition-all active:scale-90"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                                                </svg>
                                            </button>
                                        </div>
                                        {formData.animalCount >= 3 && (
                                            <div className="flex items-center gap-2 px-3 py-1 bg-orange-50 rounded-lg border border-orange-100 animate-pulse">
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#F97316]" />
                                                <span className="text-[8px] font-black text-[#F97316] uppercase tracking-[0.1em]">Pack Sighting</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Behavior Tags */}
                                <div>
                                    <label className="text-[11px] font-black text-[#1a1208] uppercase tracking-widest mb-4 block">Behavior / Traits</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Friendly', 'Frightened', 'Nursing', 'Barking', 'Roaming'].map((tag) => (
                                            <button
                                                key={tag}
                                                onClick={() => {
                                                    const tags = formData.behaviorTags.includes(tag)
                                                        ? formData.behaviorTags.filter(t => t !== tag)
                                                        : [...formData.behaviorTags, tag];
                                                    setFormData({ ...formData, behaviorTags: tags });
                                                }}
                                                className={`px-4 py-2 rounded-full text-[9px] font-bold border transition-all flex items-center gap-2 ${formData.behaviorTags.includes(tag)
                                                    ? 'bg-orange-50 text-[#F97316] border-[#F97316]'
                                                    : 'bg-white text-gray-400 border-gray-100 hover:border-orange-100'
                                                    }`}
                                            >
                                                {formData.behaviorTags.includes(tag) && <div className="w-1 h-1 rounded-full bg-[#F97316]" />}
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Consolidated Media Upload */}
                                <div>
                                    <label className="text-[11px] font-black text-[#1a1208] uppercase tracking-widest mb-4 block">Upload Photo or Video</label>
                                    <div className="relative group">
                                        <div className={`w-full aspect-video rounded-[2rem] border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all ${formData.image || formData.video ? 'border-orange-500 bg-orange-50/20' : 'border-gray-100 bg-[#FAFAF9] group-hover:border-orange-200 group-hover:bg-orange-50/10'}`}>
                                            {formData.image || formData.video ? (
                                                <div className="flex flex-col items-center gap-3">
                                                    <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-[#F97316]">
                                                        {formData.video ? (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                            </svg>
                                                        ) : (
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        )}
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-[12px] font-black text-[#F97316] uppercase tracking-widest">
                                                            {formData.video ? 'Video' : 'Photo'} Added
                                                        </p>
                                                        <p className="text-[10px] font-bold text-gray-400">Click to change media</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="w-16 h-16 rounded-[1.5rem] bg-white shadow-sm flex items-center justify-center text-gray-300 group-hover:text-[#F97316] transition-colors">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                        </svg>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tap to add Photo or Video</p>
                                                        <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mt-1">Recommended for better identification</p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            accept="image/*,video/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    if (file.type.startsWith('video/')) {
                                                        setFormData({ ...formData, video: file, image: null });
                                                    } else {
                                                        setFormData({ ...formData, image: file, video: null });
                                                    }
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Interactive Map Picker */}
                                <div>
                                    <label className="text-[11px] font-black text-[#1a1208] uppercase tracking-widest mb-4 block">Pinpoint Location</label>
                                    <div className="w-full h-64 rounded-[2rem] overflow-hidden border-2 border-gray-50 shadow-sm relative group mb-6">
                                        <MapContainer
                                            center={[formData.latitude, formData.longitude]}
                                            zoom={15}
                                            className="h-full w-full z-10"
                                            scrollWheelZoom={true}
                                        >
                                            <TileLayer
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            />
                                            <LocationPicker
                                                position={[formData.latitude, formData.longitude]}
                                                onLocationSelect={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })}
                                            />
                                        </MapContainer>
                                        <div className="absolute top-4 right-4 z-[20] bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-100 shadow-sm pointer-events-none">
                                            <p className="text-[9px] font-black text-[#F97316] uppercase tracking-widest">Click map to move pin</p>
                                        </div>
                                    </div>

                                    {/* Coordinates directly under map */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Latitude</label>
                                            <input
                                                type="text"
                                                className="w-full bg-[#FAFAF9] border border-gray-50 rounded-2xl px-5 py-3 text-[11px] font-bold text-[#F97316] shadow-sm"
                                                value={formData.latitude.toFixed(6)}
                                                readOnly
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 block">Longitude</label>
                                            <input
                                                type="text"
                                                className="w-full bg-[#FAFAF9] border border-gray-50 rounded-2xl px-5 py-3 text-[11px] font-bold text-[#F97316] shadow-sm"
                                                value={formData.longitude.toFixed(6)}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Nearby Landmark */}
                                <div>
                                    <label className="text-[11px] font-black text-[#1a1208] uppercase tracking-widest mb-4 block">Nearby Landmark (e.g., Blue Gate, Sari-sari Store)</label>
                                    <input
                                        type="text"
                                        placeholder="Add a landmark to help responders find the exact spot..."
                                        className="w-full bg-[#FAFAF9] border border-gray-50 rounded-[1.5rem] px-6 py-4 text-xs font-medium text-[#1a1208] focus:outline-none focus:border-orange-200 transition-all placeholder:text-gray-300 shadow-sm"
                                        value={formData.landmark}
                                        onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                                    />
                                </div>

                                {/* Visibility Settings */}
                                <div>
                                    <label className="text-[11px] font-black text-[#1a1208] uppercase tracking-widest mb-4 block">Report Visibility</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <label className={`relative flex flex-col p-5 rounded-[2rem] border-2 cursor-pointer transition-all ${formData.visibility === 'Public' ? 'border-[#F97316] bg-orange-50/20' : 'border-gray-50 bg-[#FAFAF9] hover:border-orange-100'}`}>
                                            <input
                                                type="radio"
                                                name="visibility"
                                                value="Public"
                                                checked={formData.visibility === 'Public'}
                                                onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                                                className="absolute opacity-0"
                                            />
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${formData.visibility === 'Public' ? 'bg-[#F97316] text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <span className={`text-[12px] font-black uppercase tracking-widest ${formData.visibility === 'Public' ? 'text-[#F97316]' : 'text-gray-600'}`}>Public Post</span>
                                            </div>
                                            <p className="text-[10px] font-bold text-gray-400 leading-relaxed ml-11">Visible to all users in the subdivision feed.</p>
                                        </label>
                                        <label className={`relative flex flex-col p-5 rounded-[2rem] border-2 cursor-pointer transition-all ${formData.visibility === 'Private' ? 'border-[#F97316] bg-orange-50/20' : 'border-gray-50 bg-[#FAFAF9] hover:border-orange-100'}`}>
                                            <input
                                                type="radio"
                                                name="visibility"
                                                value="Private"
                                                checked={formData.visibility === 'Private'}
                                                onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                                                className="absolute opacity-0"
                                            />
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${formData.visibility === 'Private' ? 'bg-[#F97316] text-white' : 'bg-gray-100 text-gray-400'}`}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    </svg>
                                                </div>
                                                <span className={`text-[12px] font-black uppercase tracking-widest ${formData.visibility === 'Private' ? 'text-[#F97316]' : 'text-gray-600'}`}>Private Post</span>
                                            </div>
                                            <p className="text-[10px] font-bold text-gray-400 leading-relaxed ml-11">Only visible to Admin, Subd. Leader, and Brgy Staff.</p>
                                        </label>
                                    </div>
                                </div>

                                {/* Description at the bottom */}
                                <div>
                                    <label className="text-[11px] font-black text-[#1a1208] uppercase tracking-widest mb-4 block">Description</label>
                                    <textarea
                                        placeholder="Provide more details (e.g., color, behavior, specific location)..."
                                        rows={4}
                                        className="w-full bg-[#FAFAF9] border border-gray-50 rounded-[2rem] p-6 text-sm font-medium focus:outline-none focus:border-orange-200 transition-all placeholder:text-gray-300 shadow-sm"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-10 pt-0">
                                <Button
                                    className="w-full py-5 bg-[#F97316] text-white text-[12px] font-black uppercase tracking-[0.2em] rounded-[2rem] shadow-xl shadow-orange-100 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    onClick={handleSubmit}
                                >
                                    {editingReportId ? 'Update Report' : 'Submit Report'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Real Report Posts */}
                {reports.length === 0 ? (
                    <div className="text-center py-20 text-gray-400 font-medium">No reports found. Be the first to submit one!</div>
                ) : (
                    reports.map((report) => {
                        const statusMap: Record<number, string> = {
                            1: 'Pending Verification', 2: 'Verified', 3: 'Rejected',
                            4: 'Forwarded to Barangay', 5: 'In Action', 6: 'Resolved',
                            7: 'Picked Up', 8: 'Under Observation', 9: 'Impounded', 10: 'Released'
                        };
                        const categoryMap: Record<number, string> = {
                            1: 'Injured Animal', 2: 'Aggressive Stray', 3: 'Possible Rabies Risk',
                            4: 'Roaming Pack', 5: 'Animal Rescue Needed'
                        };

                        const statusName = statusMap[report.status_id] || 'Unknown Status';
                        const categoryName = categoryMap[report.category_id] || 'Other Report';
                        const date = new Date(report.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });

                        return (
                            <div key={report.report_id} className="max-w-3xl mx-auto">
                                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden mb-12 hover:shadow-2xl transition-all duration-300">
                                    {/* Header */}
                                    <div className="p-8 pb-4">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-3">
                                                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${report.status_id === 1 ? 'bg-orange-50 text-[#F97316] border-orange-100' :
                                                    report.status_id === 6 ? 'bg-green-50 text-green-600 border-green-100' :
                                                        report.status_id === 7 || report.status_id === 8 ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                                            report.status_id === 9 || report.status_id === 10 ? 'bg-teal-50 text-teal-600 border-teal-100' :
                                                                'bg-blue-50 text-blue-600 border-blue-100'
                                                    }`}>
                                                    {statusName}
                                                </span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-l border-gray-100 pl-3">
                                                    SR-{report.report_id.toString().padStart(5, '0')}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <p className="text-[11px] font-semibold text-[#1a1208]">{date}</p>
                                                {report.user_id === currentUserId && (
                                                    <div className="relative" ref={openMenuId === report.report_id ? menuRef : null}>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setOpenMenuId(openMenuId === report.report_id ? null : report.report_id);
                                                            }}
                                                            className="p-1.5 text-gray-400 hover:text-[#1a1208] rounded-full hover:bg-gray-50 transition-all"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                                                            </svg>
                                                        </button>

                                                        {openMenuId === report.report_id && (
                                                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleEditClick(report);
                                                                    }}
                                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-[#F97316] hover:bg-orange-50 transition-colors"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                    </svg>
                                                                    Edit Post
                                                                </button>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleDeleteReport(report.report_id);
                                                                        setOpenMenuId(null);
                                                                    }}
                                                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[11px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                    Delete Report
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <h2 className="text-3xl font-black text-[#1a1208] uppercase tracking-tight">{categoryName}</h2>
                                            <div className="flex items-center gap-2 mt-2 text-gray-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <p className="text-[11px] font-bold uppercase tracking-widest">
                                                    Lat: {report.latitude.toFixed(4)}, Lng: {report.longitude.toFixed(4)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Media Image */}
                                    {report.media && report.media.length > 0 && (
                                        <div className="px-8 pb-6">
                                            <div className="w-full h-72 rounded-2xl overflow-hidden border border-gray-100 shadow-inner">
                                                {report.media[0].media_type === 'Video' ? (
                                                    <video src={report.media[0].file_url} className="w-full h-full object-cover" />
                                                ) : report.media[0].media_type === 'Document' ? (
                                                    <div className="w-full h-full flex flex-col items-center justify-center bg-orange-50 text-[#F97316] p-4 gap-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-center">Official Document</span>
                                                    </div>
                                                ) : (
                                                    <img src={report.media[0].file_url} alt="Report Media" className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                            <div className="mt-4 flex gap-3">
                                                {(() => {
                                                    let viewUrl = report.media[0].file_url;
                                                    const isPdf = report.media[0].media_type === 'Document' || viewUrl.toLowerCase().endsWith('.pdf');
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
                                                                className="flex-1 py-2 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 transition-all text-center"
                                                            >
                                                                View Original
                                                            </a>
                                                            <a
                                                                href={report.media[0].file_url.replace('/upload/', `/upload/fl_attachment:StraySafe_Media_${report.media[0].media_id}/`)}
                                                                className="flex-1 py-2 bg-orange-50 border border-orange-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#F97316] hover:bg-orange-100 transition-all text-center"
                                                            >
                                                                Download
                                                            </a>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    )}

                                    {/* Description */}
                                    <div className="px-8 pb-8">
                                        <div className="bg-[#FAFAF9] p-6 rounded-2xl border border-gray-50">
                                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2">Description</p>
                                            <p className="text-sm font-bold text-[#4a3b28] leading-relaxed italic">
                                                "{report.description || 'No description provided.'}"
                                            </p>
                                        </div>

                                        {report.landmark && (
                                            <div className="mt-4 px-2 flex items-center gap-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                                <span className="text-[#F97316]">Landmark:</span> {report.landmark}
                                            </div>
                                        )}
                                        <div className="mt-2 px-2 flex items-center gap-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                            <span className="text-[#F97316]">Priority:</span> {report.priority_level}
                                            <span className="mx-2">|</span>
                                            <span className="text-[#F97316]">Animals:</span> {report.animal_count}
                                        </div>
                                    </div>

                                    {/* Comments Section */}
                                    <div className="bg-white border-t border-gray-100 p-8 pt-6">
                                        {report.comments && report.comments.length > 0 && (
                                            <button
                                                onClick={() => setExpandedComments(prev => ({ ...prev, [report.report_id]: !prev[report.report_id] }))}
                                                className="text-[10px] font-black text-gray-400 hover:text-[#F97316] uppercase tracking-widest transition-colors flex items-center gap-2 mb-6"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform duration-300 ${expandedComments[report.report_id] ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                                </svg>
                                                {expandedComments[report.report_id] ? 'Hide Comments' : `View all ${report.comments.length} comments`}
                                            </button>
                                        )}

                                        {(expandedComments[report.report_id] || !report.comments || report.comments.length === 0) && (
                                            <div className="space-y-2 mb-6 max-h-72 overflow-y-auto custom-scrollbar pr-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                                {report.comments && report.comments.length > 0 ? (
                                                    report.comments.filter((c: any) => !c.parent_comment_id).map((c: any) => {
                                                        const replies = report.comments.filter((reply: any) => reply.parent_comment_id === c.comment_id);
                                                        return (
                                                            <div key={c.comment_id} className="mb-4 last:mb-0">
                                                                <div className="flex gap-3 relative">
                                                                    {/* Parent Avatar & Vertical Line */}
                                                                    <div className="relative flex flex-col items-center shrink-0">
                                                                        <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-[#F97316] font-black text-xs z-10 ring-4 ring-white border border-orange-100">
                                                                            {c.user_name.charAt(0).toUpperCase()}
                                                                        </div>
                                                                        {(replies.length > 0 || replyingTo[report.report_id]?.commentId === c.comment_id) && (
                                                                            <div className="absolute top-8 bottom-[-16px] left-1/2 -translate-x-1/2 w-[2px] bg-gray-100 z-0"></div>
                                                                        )}
                                                                    </div>

                                                                    <div className="flex-1 pb-1">
                                                                        {/* Parent Bubble */}
                                                                        <div className="bg-[#FAFAF9] rounded-[1.5rem] p-3.5 px-4 border border-gray-50 shadow-sm inline-block">
                                                                            <span className="block text-[11px] font-black text-[#1a1208] mb-0.5">{c.user_name}</span>
                                                                            <p className="text-xs font-semibold text-gray-700 leading-relaxed pr-6">{c.message}</p>
                                                                        </div>
                                                                        {/* Parent Actions */}
                                                                        <div className="flex items-center gap-4 mt-1.5 ml-3">
                                                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{new Date(c.created_at).toLocaleDateString()}</span>
                                                                            <button
                                                                                onClick={() => setReplyingTo(prev => ({ ...prev, [report.report_id]: { commentId: c.comment_id, userName: c.user_name } }))}
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
                                                                                        {index === replies.length - 1 && replyingTo[report.report_id]?.commentId !== c.comment_id && (
                                                                                            <div className="absolute top-[16px] bottom-[-100px] left-[-30px] w-[6px] bg-white z-0 pointer-events-none"></div>
                                                                                        )}

                                                                                        {/* Child Avatar */}
                                                                                        <div className="w-6 h-6 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 font-bold text-[10px] z-10 mt-1 ring-4 ring-white border border-gray-100 shrink-0">
                                                                                            {reply.user_name.charAt(0).toUpperCase()}
                                                                                        </div>

                                                                                        <div className="flex-1">
                                                                                            {/* Child Bubble */}
                                                                                            <div className="bg-[#FAFAF9] rounded-[1.2rem] p-3 px-4 border border-gray-50 shadow-sm inline-block">
                                                                                                <span className="block text-[10px] font-black text-gray-800 mb-0.5">{reply.user_name}</span>
                                                                                                <p className="text-[11px] font-semibold text-gray-600 leading-relaxed pr-4">{reply.message}</p>
                                                                                            </div>
                                                                                            {/* Child Actions */}
                                                                                            <div className="flex items-center gap-4 mt-1.5 ml-3">
                                                                                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{new Date(reply.created_at).toLocaleDateString()}</span>
                                                                                                <button
                                                                                                    onClick={() => setReplyingTo(prev => ({ ...prev, [report.report_id]: { commentId: c.comment_id, userName: reply.user_name } }))}
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
                                                                        {replyingTo[report.report_id]?.commentId === c.comment_id && (
                                                                            <div className="mt-4 flex items-center gap-3 relative z-10 animate-in fade-in slide-in-from-top-2 duration-200">
                                                                                {/* Thread curve for the reply input itself */}
                                                                                <div className="absolute top-[-10px] left-[-28px] w-[28px] h-[24px] border-b-[2px] border-l-[2px] border-gray-100 rounded-bl-[12px] z-0 pointer-events-none"></div>
                                                                                {/* Mask to hide vertical line below the inline reply input */}
                                                                                <div className="absolute top-[14px] bottom-[-100px] left-[-30px] w-[6px] bg-white z-0 pointer-events-none"></div>

                                                                                <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-[#F97316] font-black text-[10px] shrink-0 border border-orange-200 z-10 bg-white ring-4 ring-white">
                                                                                    {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                                                                                </div>
                                                                                <div className="flex-1 relative flex items-center">
                                                                                    <input
                                                                                        type="text"
                                                                                        autoFocus
                                                                                        placeholder={`Replying to ${replyingTo[report.report_id]?.userName}...`}
                                                                                        className="w-full bg-[#FAFAF9] border border-gray-100 rounded-[1.2rem] pl-4 pr-10 py-2 text-[11px] font-semibold text-[#1a1208] focus:outline-none focus:border-orange-200 focus:bg-white transition-all placeholder:text-gray-400 shadow-inner"
                                                                                        value={commentInputs[report.report_id] || ''}
                                                                                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [report.report_id]: e.target.value }))}
                                                                                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment(report.report_id)}
                                                                                    />
                                                                                    <button
                                                                                        onClick={() => {
                                                                                            setReplyingTo(prev => ({ ...prev, [report.report_id]: null }));
                                                                                            setCommentInputs(prev => ({ ...prev, [report.report_id]: '' }));
                                                                                        }}
                                                                                        className="absolute right-3 text-gray-400 hover:text-red-500 transition-colors"
                                                                                    >
                                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                                                                        </svg>
                                                                                    </button>
                                                                                </div>
                                                                                <button
                                                                                    onClick={() => handleAddComment(report.report_id)}
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


                                        {!replyingTo[report.report_id] && (
                                            <div className="flex items-center gap-3 animate-in fade-in duration-200">
                                                <div className="flex-1 relative">
                                                    <input
                                                        type="text"
                                                        placeholder="Write a comment..."
                                                        className="w-full bg-[#FAFAF9] border border-gray-100 rounded-[1.5rem] pl-5 pr-12 py-3 text-xs font-semibold text-[#1a1208] focus:outline-none focus:border-orange-200 focus:bg-white transition-all placeholder:text-gray-300 shadow-inner"
                                                        value={commentInputs[report.report_id] || ''}
                                                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [report.report_id]: e.target.value }))}
                                                        onKeyPress={(e) => e.key === 'Enter' && handleAddComment(report.report_id)}
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => handleAddComment(report.report_id)}
                                                    className="bg-[#F97316] text-white rounded-[1.2rem] p-3 shadow-md shadow-orange-100 hover:scale-105 active:scale-95 transition-all flex-shrink-0"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                )}

                {/* Dashboard content cleared as requested */}
            </main>
        </div>
    );
};

export default ResiHomePage;
