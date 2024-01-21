import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapDisplay = ({ center, zoom }) => {
    return (
        <div id="mapBackground" style={{ height: "50%", width: "100%"}}>
            <MapContainer center={center} zoom={zoom} zoomControl={false} scrollWheelZoom={false} dragging={false} style={{height: "100%"}}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[51.505, -0.09]}>
                <Popup>
                    A pretty CSS3 popup. <br /> Easily customizable.
                </Popup>
            </Marker>
        </MapContainer>
        </div>


    )
}

export default MapDisplay;