import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
import L from 'leaflet';

// Fix for default marker icon issue in React Leaflet
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

import HeatmapLayer from './HeatmapLayer';

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
    onLocationChange
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
                <Marker key={marker.id} position={[marker.lat, marker.lng]}>
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
                            <div className="pt-2 border-t border-gray-50">
                                <button className="w-full py-1.5 bg-orange-50 text-[#F97316] text-[9px] font-black uppercase rounded-lg hover:bg-orange-100 transition-colors">
                                    View Report Details
                                </button>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}

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

