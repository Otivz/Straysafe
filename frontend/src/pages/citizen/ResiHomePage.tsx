import { useState, useRef, useEffect } from 'react';
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
    const [isCardMenuOpen, setIsCardMenuOpen] = useState(false);
    const [isAddReportModalOpen, setIsAddReportModalOpen] = useState(false);
    const cardMenuRef = useRef<HTMLDivElement>(null);
    const [isProgressExpanded, setIsProgressExpanded] = useState(false);

    // Form state aligned with reports table
    const [formData, setFormData] = useState({
        category: 'Dog',
        breed: '', 
        condition: 'Healthy', // New field
        animalCount: 1,       // Changed to number for stepper
        landmark: '',         // New field
        behaviorTags: [] as string[], // New field
        description: '',
        latitude: 14.801313, 
        longitude: 121.003109,
        image: null as File | null,
        video: null as File | null
    });

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (cardMenuRef.current && !cardMenuRef.current.contains(event.target as Node)) {
                setIsCardMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="min-h-screen bg-[#FAFAF9] font-sans">
            <ResiNavbar />

            <main className="max-w-6xl mx-auto p-8 pt-28">

                {/* Top Actions */}
                <div className="flex justify-end items-center mb-10">
                    <Button
                        variant="primary"
                        onClick={() => setIsAddReportModalOpen(true)}
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
                                    <h2 className="text-3xl font-black text-[#1a1208] uppercase tracking-tight">Report a Stray</h2>
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
                                                            onChange={() => setFormData({...formData, category: cat})}
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
                                            onChange={(e) => setFormData({...formData, breed: e.target.value})}
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
                                                onClick={() => setFormData({...formData, condition: cond})}
                                                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                                                    formData.condition === cond 
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
                                                onClick={() => setFormData({...formData, animalCount: Math.max(1, formData.animalCount - 1)})}
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
                                                onClick={() => setFormData({...formData, animalCount: formData.animalCount + 1})}
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
                                                    setFormData({...formData, behaviorTags: tags});
                                                }}
                                                className={`px-4 py-2 rounded-full text-[9px] font-bold border transition-all flex items-center gap-2 ${
                                                    formData.behaviorTags.includes(tag)
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
                                                        setFormData({...formData, video: file, image: null});
                                                    } else {
                                                        setFormData({...formData, image: file, video: null});
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
                                                onLocationSelect={(lat, lng) => setFormData({...formData, latitude: lat, longitude: lng})}
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
                                        onChange={(e) => setFormData({...formData, landmark: e.target.value})}
                                    />
                                </div>

                                {/* Description at the bottom */}
                                <div>
                                    <label className="text-[11px] font-black text-[#1a1208] uppercase tracking-widest mb-4 block">Description</label>
                                    <textarea 
                                        placeholder="Provide more details (e.g., color, behavior, specific location)..."
                                        rows={4}
                                        className="w-full bg-[#FAFAF9] border border-gray-50 rounded-[2rem] p-6 text-sm font-medium focus:outline-none focus:border-orange-200 transition-all placeholder:text-gray-300 shadow-sm"
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    />
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-10 pt-0">
                                <Button 
                                    className="w-full py-5 bg-[#F97316] text-white text-[12px] font-black uppercase tracking-[0.2em] rounded-[2rem] shadow-xl shadow-orange-100 hover:scale-[1.02] active:scale-[0.98] transition-all"
                                    onClick={() => setIsAddReportModalOpen(false)}
                                >
                                    Submit Report
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sample Report Post */}
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl overflow-hidden mb-12">
                        {/* Header */}
                        {/* Header */}
                        <div className="p-8 pb-4">
                            {/* Metadata Row */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 bg-orange-50 text-[#F97316] text-[10px] font-black uppercase tracking-widest rounded-full border border-orange-100">
                                        Pending Verification
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-l border-gray-100 pl-3">
                                        SR-00124
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <p className="text-[11px] font-semibold text-[#1a1208]">April 27, 2:15 PM</p>
                                    <div className="h-4 w-[1px] bg-gray-100" />
                                    <div className="relative" ref={cardMenuRef}>
                                        <button
                                            onClick={() => setIsCardMenuOpen(!isCardMenuOpen)}
                                            className={`p-1.5 transition-all rounded-lg ${isCardMenuOpen ? 'bg-gray-100 text-[#1a1208]' : 'text-gray-400 hover:text-[#1a1208]'}`}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 16 16">
                                                <path d="M3 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
                                            </svg>
                                        </button>

                                        {/* Dropdown Menu */}
                                        {isCardMenuOpen && (
                                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                                                <button
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-[#4a3b28] hover:bg-[#FAFAF9] hover:text-[#F97316] transition-all"
                                                    onClick={() => setIsCardMenuOpen(false)}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    Edit Report
                                                </button>
                                                <div className="h-[1px] bg-gray-50 mx-2 my-1" />
                                                <button
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-[#EF4444] hover:bg-red-50 transition-all"
                                                    onClick={() => setIsCardMenuOpen(false)}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Delete Report
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Content Row */}
                            <div>
                                <h2 className="text-3xl font-black text-[#1a1208] uppercase tracking-tight">Stray Dog Roaming</h2>
                                <div className="flex items-center gap-2 mt-2 text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <p className="text-[11px] font-bold uppercase tracking-widest">Block 5, Phase 2</p>
                                </div>
                            </div>
                        </div>

                        {/* Image & Description */}
                        <div className="px-8 pb-8">
                            <div className="relative aspect-[16/9] rounded-3xl overflow-hidden bg-gray-100 mb-6 shadow-inner border border-gray-50">
                                <img
                                    src="https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=1000"
                                    alt="Reported Dog"
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-4 left-4 p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 text-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                            </div>

                            <div className="bg-[#FAFAF9] p-6 rounded-2xl border border-gray-50">
                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-2">Description</p>
                                <p className="text-sm font-bold text-[#4a3b28] leading-relaxed italic">
                                    "Brown dog roaming near playground, no collar."
                                </p>
                            </div>
                        </div>

                        {/* Progress Tracker (Collapsible) */}
                        <div className="px-8 pb-6">
                            <button 
                                onClick={() => setIsProgressExpanded(!isProgressExpanded)}
                                className="w-full flex items-center justify-between py-3 px-4 bg-gray-50/50 rounded-2xl border border-gray-50 group hover:bg-[#F97316]/5 transition-all"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full transition-all ${isProgressExpanded ? 'bg-[#F97316] animate-pulse' : 'bg-gray-300'}`} />
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover:text-[#F97316] transition-colors">Report Progress</p>
                                </div>
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    className={`h-4 w-4 text-gray-300 transition-transform duration-300 ${isProgressExpanded ? 'rotate-180 text-[#F97316]' : ''}`} 
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            
                            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isProgressExpanded ? 'max-h-60 opacity-100 mt-8 mb-4' : 'max-h-0 opacity-0'}`}>
                                <div className="relative flex justify-between px-2">
                                    {/* Track Line */}
                                    <div className="absolute top-4 left-0 right-0 h-[2px] bg-gray-100 -z-0">
                                        <div className="h-full bg-[#F97316] w-1/4"></div>
                                    </div>
                                    
                                    {[
                                        { label: 'Submitted', status: 'completed' },
                                        { label: 'Under Review', status: 'current' },
                                        { label: 'Responding', status: 'pending' },
                                        { label: 'Resolved', status: 'pending' }
                                    ].map((step) => (
                                        <div key={step.label} className="relative z-10 flex flex-col items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 border-white shadow-md transition-all ${step.status === 'completed' ? 'bg-[#F97316] text-white scale-110' :
                                                    step.status === 'current' ? 'bg-white text-[#F97316] border-orange-100 animate-pulse' :
                                                        'bg-gray-100 text-gray-300'
                                                }`}>
                                                {step.status === 'completed' ? (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                ) : (
                                                    <div className={`w-2 h-2 rounded-full ${step.status === 'current' ? 'bg-[#F97316]' : 'bg-gray-300'}`}></div>
                                                )}
                                            </div>
                                            <span className={`text-[9px] font-black uppercase tracking-widest ${step.status === 'pending' ? 'text-gray-300' : 'text-[#1a1208]'}`}>
                                                {step.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Comment Input (Facebook Style) */}
                        <div className="bg-[#FAFAF9] px-8 py-5 border-t border-gray-50 flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0 border border-white shadow-sm">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                            </div>
                            <div className="flex-1 relative">
                                <input
                                    type="text"
                                    placeholder="Write a comment..."
                                    className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-2.5 text-xs font-medium focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-orange-100 transition-all placeholder:text-gray-300"
                                />
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-gray-300">
                                    <button className="hover:text-gray-400 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </button>
                                    <button className="hover:text-gray-400 transition-colors">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dashboard content cleared as requested */}
            </main>
        </div>
    );
};

export default ResiHomePage;
