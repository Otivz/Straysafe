import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';
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

import HeatmapLayer from './HeatmapLayer';

interface MapComponentProps {
    height?: string;
    center?: [number, number];
    zoom?: number;
    showHeatmap?: boolean;
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

// Mock heatmap data for San Vicente, Santa Maria, Bulacan
const mockHeatmapPoints: [number, number, number][] = [
    [14.8093, 121.0028, 1.0], // Core hotspot
    [14.8095, 121.0030, 0.8],
    [14.8091, 121.0025, 0.7],
    [14.8100, 121.0040, 0.5],
    [14.8085, 121.0015, 0.6],
    [14.8070, 121.0000, 0.4],
    [14.8110, 121.0050, 0.3],
];

const MapComponent = ({ 
    height = "100%", 
    center = [14.6760, 121.0437], 
    zoom = 13,
    showHeatmap = true,
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
                    points={mockHeatmapPoints} 
                    options={{ radius: 35, blur: 15 }} 
                />
            )}

            <Marker 
                position={center} 
                draggable={!!onLocationChange}
                eventHandlers={eventHandlers}
            >
                <Popup>
                    Location: {center[0].toFixed(4)}, {center[1].toFixed(4)}
                </Popup>
            </Marker>
        </MapContainer>
    );
};

export default MapComponent;

