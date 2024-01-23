import { MapContainer, TileLayer, Marker, Popup, Rectangle, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapDisplay = ({ bounds, zoom }) => {
    // let testLine = {"type": "LineString","coordinates": [[43.2614, -79.93], [43.262, -79.932]]}
    let testLine = {
        "type": "Feature",
        "properties": {
            "name": "Coors Field",
            "amenity": "Baseball Stadium",
            "popupContent": "This is where the Rockies play!"
        },
        "geometry": {
            "type": "Point",
            "coordinates": [43.262, -79.932]
        }
    };
    return (
        <div id="mapBackground">
            <MapContainer bounds={bounds} zoom={zoom} zoomControl={false} scrollWheelZoom={false} dragging={false} style={{height: "100%"}}>
            {/* <Rectangle bounds={bounds}></Rectangle> */}
            
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[43.2614, -79.93]}>
                <Popup>
                    A pretty CSS3 popup. <br /> Easily customizable.
                </Popup>
            </Marker>
            <GeoJSON key={testLine} attribution="pog swag" data={testLine}></GeoJSON>
        </MapContainer>
        </div>


    )
}

export default MapDisplay;