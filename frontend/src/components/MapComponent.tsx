import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import L from 'leaflet';

// Fix for default marker icon issue in React Leaflet
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const BrgyIcon = L.divIcon({
    html: `
        <div style="
            background: #F97316;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 20px;
            animation: bounce 2s infinite;
        ">
            🏠
        </div>
    `,
    className: '',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40]
});

const MeIcon = L.divIcon({
    html: `
        <div style="position: relative;">
            <div style="
                background: #3B82F6;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 0 10px rgba(59,130,246,0.5);
            "></div>
            <div style="
                position: absolute;
                top: 0;
                left: 0;
                width: 20px;
                height: 20px;
                background: #3B82F6;
                border-radius: 50%;
                opacity: 0.4;
                animation: pulse 2s infinite;
            "></div>
        </div>
    `,
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
});

import HeatmapLayer from './HeatmapLayer';
import RoutingControl from './RoutingControl';

interface MapComponentProps {
    height?: string;
    center?: [number, number];
    zoom?: number;
    showHeatmap?: boolean;
    heatmapPoints?: [number, number, number][];
    markers?: { 
        id: number, 
        lat: number, 
        lng: number, 
        title: string, 
        priority?: string, 
        time?: string,
        category?: string 
    }[];
    onLocationChange?: (lat: number, lng: number) => void;
    routing?: {
        start: [number, number];
        end: [number, number];
        waypointNames?: [string, string];
        onRoutingUpdate?: (data: { distance: string; time: string }) => void;
    };
    onMarkerClick?: (marker: any) => void;
}

// Internal component to handle view changes
const ChangeView = ({ center, zoom }: { center: [number, number], zoom: number }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
};

const MapComponent = ({ 
    height = "100%", 
    center = [14.6760, 121.0437], 
    zoom = 13,
    showHeatmap = true,
    heatmapPoints = [],
    markers = [],
    onLocationChange,
    routing,
    onMarkerClick
}: MapComponentProps) => {
    const eventHandlers = {
        dragend(e: any) {
            const marker = e.target;
            if (marker != null && onLocationChange) {
                const { lat, lng } = marker.getLatLng();
                onLocationChange(lat, lng);
            }
        },
    };
    return (
        <MapContainer 
            center={center} 
            zoom={zoom} 
            scrollWheelZoom={false} 
            style={{ height: height, width: '100%' }}
        >
            <ChangeView center={center} zoom={zoom} />
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {showHeatmap && (
                <HeatmapLayer 
                    points={heatmapPoints} 
                    options={{ radius: 35, blur: 15 }} 
                />
            )}

            {markers.map((marker) => (
                <Marker 
                    key={marker.id} 
                    position={[marker.lat, marker.lng]}
                    icon={
                        marker.category === 'Barangay Office' ? BrgyIcon : 
                        marker.category === 'User Location' ? MeIcon : DefaultIcon
                    }
                    eventHandlers={{
                        popupopen: () => onMarkerClick && onMarkerClick(marker)
                    }}
                >
                    <Popup className="custom-popup">
                        <div className="p-3 min-w-[180px]">
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                                    marker.priority === 'High' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'
                                }`}>
                                    {marker.priority || 'Regular'}
                                </span>
                                <span className="text-[8px] font-bold text-gray-400 uppercase">{marker.time}</span>
                            </div>
                            <h3 className="font-black text-xs uppercase text-[#1a1208] mb-1">{marker.category || 'Stray Animal'}</h3>
                            <p className="text-[10px] text-gray-500 leading-tight mb-2 italic">"{marker.title}"</p>
                            <div className="pt-2 border-t border-gray-100 flex flex-col gap-2">
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest text-center mt-1">Get Directions</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <button 
                                        onClick={(e) => {
                                            console.log("From Office clicked");
                                            e.stopPropagation();
                                            if (onMarkerClick) onMarkerClick({ ...marker, source: 'brgy' });
                                        }}
                                        className="py-2 bg-orange-600 text-white text-[9px] font-black uppercase rounded-lg hover:bg-orange-700 transition-colors shadow-sm"
                                    >
                                        From Office
                                    </button>
                                    <button 
                                        onClick={(e) => {
                                            console.log("From Me clicked");
                                            e.stopPropagation();
                                            if (onMarkerClick) onMarkerClick({ ...marker, source: 'current' });
                                        }}
                                        className="py-2 bg-gray-900 text-white text-[9px] font-black uppercase rounded-lg hover:bg-black transition-colors shadow-sm"
                                    >
                                        From Me
                                    </button>
                                </div>
                                <button className="w-full py-2 bg-gray-50 text-gray-400 text-[8px] font-black uppercase rounded-lg hover:bg-gray-100 transition-colors mt-1">
                                    View Full Details
                                </button>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}

            {routing && (
                <RoutingControl 
                    key={`${routing.start[0]}-${routing.start[1]}-${routing.end[0]}-${routing.end[1]}`}
                    start={routing.start} 
                    end={routing.end} 
                    waypointNames={routing.waypointNames}
                    onRoutingUpdate={routing.onRoutingUpdate}
                />
            )}

            {onLocationChange && (
                <Marker 
                    position={center} 
                    draggable={true}
                    eventHandlers={eventHandlers}
                >
                    <Popup>
                        Location: {center[0].toFixed(4)}, {center[1].toFixed(4)}
                    </Popup>
                </Marker>
            )}
        </MapContainer>
    );
};

export default MapComponent;

