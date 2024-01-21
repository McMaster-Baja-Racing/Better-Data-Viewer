import { MapContainer, TileLayer, Marker, Popup, Rectangle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapDisplay = ({ bounds, zoom }) => {
    return (
        <div id="mapBackground">
            <MapContainer bounds={bounds} zoom={zoom} zoomControl={false} scrollWheelZoom={false} dragging={false} style={{height: "100%"}}>
            <Rectangle bounds={bounds}></Rectangle>
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