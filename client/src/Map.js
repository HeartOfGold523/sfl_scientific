import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet'
import { Icon } from 'leaflet'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import 'leaflet/dist/leaflet.css'

// Helper Map Child Component
const ChangeMapView = ({ coords }) => {
    const map = useMap()
    map.setView(coords, 25)
    return null
}
  
// Helper Map Parent Component
const MapComponent = ({ coords }) => {
    return (
        <MapContainer center={coords} zoom={25} scrollWheelZoom={false} style={{width: `400px`, height: `400px`, zIndex: `10`, borderRadius: `60px`}}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={coords} icon={new Icon({iconUrl: markerIcon, iconSize: [25, 41], iconAnchor: [12, 41]})} />
            <ChangeMapView coords={coords} />
        </MapContainer>
    )
}

export default MapComponent