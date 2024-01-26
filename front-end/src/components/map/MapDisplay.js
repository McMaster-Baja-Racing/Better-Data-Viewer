import { MapContainer, TileLayer, Marker, Popup, Rectangle, GeoJSON } from 'react-leaflet';
import L from "leaflet";
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
let coords = require('./testData.json')

const MapDisplay = ({ bounds, zoom }) => {

    const [counter, setCounter] = useState(0);

    useEffect(() => {
        const timerId = setInterval(() => {
            setCounter(counter + 1);
        }, 5)
        return () => clearInterval(timerId);
    })

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

    if (counter >= coords.length - 1) {
        setCounter(0);
    }

    const marker = L.icon({ iconUrl: "https://unpkg.com/leaflet@1.5.1/dist/images/marker-icon.png", shadowUrl: "https://unpkg.com/leaflet@1.5.1/dist/images/marker-shadow.png",     iconAnchor:   [13, 38]})
    return (
        <div id="mapBackground">
            <MapContainer bounds={bounds} style={{ height: "100%" }} dragging={true} scrollWheelZoom={true} >
                <GeoJSON key={testLine} data={testLine} style={{ stroke: true, color: "#ff2222", weight: 5 }}></GeoJSON>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                    subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                    maxZoom={20}
            />
                {/* <Marker position={[coords[0][1], coords[0][0]]} icon={marker} /> */}
                <Marker position={[coords[counter][1], coords[counter][0]]} icon={marker} />
        </MapContainer>
        </div>


    )
}

export default MapDisplay;