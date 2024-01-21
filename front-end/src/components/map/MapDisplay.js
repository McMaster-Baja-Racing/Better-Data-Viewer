import { MapContainer, TileLayer, Marker, Popup, Rectangle, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapDisplay = ({ bounds, zoom }) => {
    let testLine = {"type": "LineString","coordinates": [[43.2614, -79.93], [43.262, -79.932]]}
    return (
        <div id="mapBackground">
            <MapContainer bounds={bounds} zoom={zoom} zoomControl={false} scrollWheelZoom={false} dragging={false} style={{height: "100%"}}>
            <Rectangle bounds={bounds}></Rectangle>
            <GeoJSON attribution="pog swag" data={testLine}></GeoJSON>
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