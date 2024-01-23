import { MapContainer, TileLayer, Marker, Popup, Rectangle, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
// let coords = require('./testData.json')

const MapDisplay = ({ bounds, zoom }) => {
    // let testLine = {"type": "LineString","coordinates": [[43.2614, -79.93], [43.262, -79.932]]}
    // GEOJSON USES LONG, LAT NOT LAT, LONG
    let testLine = {
        type: "Feature",
        "properties": {
            "name": "Coors Field",
            "amenity": "Baseball Stadium",
            "popupContent": "This is where the Rockies play!"
        },
        geometry: {
            type: "LineString",
            coordinates: []
        }
    };
    return (
        <div id="mapBackground">
            <MapContainer bounds={bounds} style={{height: "100%"}} dragging={true} scrollWheelZoom={true}>
            {/* <GeoJSON key={testLine} data={testLine} style={{stroke: true, color: "#ff00ff", weight: 1}}></GeoJSON> */}
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
        </MapContainer>
        </div>


    )
}

export default MapDisplay;