import { MapContainer, TileLayer, Marker, Popup, Rectangle, GeoJSON } from 'react-leaflet';
import L from "leaflet";
import 'leaflet/dist/leaflet.css';
let coords = require('./testData.json')

const MapDisplay = ({ bounds, zoom }) => {
    // GEOJSON USES LONG, LAT NOT LAT, LONG
    let testLine = [{
            type: "LineString",
        coordinates: coords
    },
        // {
        //     type: "Point",
        //     coordinates: coords[0]
        // },
        // {
        //     type: "Point",
        //     coordinates: coords[coords.length - 1]
        // }
    ];

    const marker = L.icon({ iconUrl: "https://unpkg.com/leaflet@1.5.1/dist/images/marker-icon.png", shadowUrl: "https://unpkg.com/leaflet@1.5.1/dist/images/marker-shadow.png",     iconAnchor:   [13, 38]})
    return (
        <div id="mapBackground">
            <MapContainer bounds={bounds} style={{ height: "100%" }} dragging={true} scrollWheelZoom={true} >
                <GeoJSON key={testLine} data={testLine} style={{ stroke: true, color: "#ff2222", weight: 3 }}></GeoJSON>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    maxZoom={20}
            />
                {/* <Marker position={[coords[0][1], coords[0][0]]} icon={marker} /> */}
                <Marker position={[coords[coords.length-1][1], coords[coords.length-1][0]]} icon={marker} />
        </MapContainer>
        </div>


    )
}

export default MapDisplay;