import { MapContainer, TileLayer, Marker, Popup, Rectangle, GeoJSON, useMapEvents } from 'react-leaflet';
import L, { point } from "leaflet";
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
let coords = require('./testData.json')

const ENTER = "enter";
const EXIT = "exit";

function boundaryEvent(event, rect, time) {
    return {event: event, rect: rect, time: time};
}

function pointInRect(point, bounds) {
    if (!bounds) return false;
    if (!point) return false;
    // console.log(point, bounds);
    let px = point[0];
    let py = point[1];
    let b1x = bounds[0][0];
    let b1y = bounds[0][1];
    let b2x = bounds[1][0];
    let b2y = bounds[1][1];

    if (px > Math.min(b1x, b2x) && px < Math.max(b1x, b2x)) {
        if (py > Math.min(b1y, b2y) && py < Math.max(b1y, b2y)) {
            return true;
        }
    }
    return false;
}

const MapDisplay = ({ bounds, zoom }) => {

    const [counter, setCounter] = useState(0);
    const [drawing, setDrawing] = useState(false);
    const [boundsStart, setBoundsStart] = useState([0, 0]);
    const [boundsEnd, setBoundsEnd] = useState([0, 0]);
    const [rects, setRects] = useState([]);
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const timerId = setInterval(() => {
            setCounter(counter + 1);
            if (counter >= coords.length - 1) {
                setCounter(0);
                setEvents([]);
            }
            rects.forEach(elem => {
                if(pointInRect([coords[counter][1], coords[counter][0]], elem)) {
                    if(events.length === 0 || (events[events.length - 1].event === EXIT && events[events.length - 1].rect !== elem)) {
                        if(events.length > 0 && events[events.length - 1].event === EXIT) {
                            console.log("Time between blocks:", counter - events[events.length - 1].time);
                        }
                        setEvents([...events, boundaryEvent(ENTER, elem, counter)]);
                    }
                } else {
                    if(events.length > 0 && events[events.length - 1].event === ENTER && events[events.length - 1].rect === elem) {
                        setEvents([...events, boundaryEvent(EXIT, elem, counter)]);
                    }
                }
            })
        }, 1)
        return () => clearInterval(timerId);
    })

    const MapEvents = () => {
        useMapEvents({
            mousemove(e) {
                if (drawing) {
                    setBoundsEnd([e.latlng.lat, e.latlng.lng]);
                }
            },
            mousedown(e) {
                console.log(e);
                // only right click
                if(e.originalEvent.button !== 0) return;
                if(drawing) return;
                setDrawing(true);
                setBoundsStart([e.latlng.lat, e.latlng.lng]);
                setBoundsEnd([e.latlng.lat, e.latlng.lng]);
            },
            mouseup(e) {
                if(e.originalEvent.button !== 0) return;
                if(!drawing) return;
                setDrawing(false);
                setBoundsEnd([e.latlng.lat, e.latlng.lng]);
                setRects((old) => [...old, [boundsStart, boundsEnd]])
            }
        });
        return false;
    }

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



    const marker = L.icon({ iconUrl: "https://unpkg.com/leaflet@1.5.1/dist/images/marker-icon.png", shadowUrl: "https://unpkg.com/leaflet@1.5.1/dist/images/marker-shadow.png", iconAnchor: [13, 38] })
    return (
        <div id="mapBackground">
            <MapContainer bounds={bounds} style={{ height: "100%" }} dragging={false} scrollWheelZoom={true} >
                <GeoJSON key={testLine} data={testLine} style={{ stroke: true, color: "#2222ff", weight: 5 }}></GeoJSON>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                    subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                    maxZoom={20}
                />
                <MapEvents />
                {drawing ? <Rectangle bounds={[boundsStart, boundsEnd]} /> : null}
                {rects.map((bounds, index) => {
                    let inside = pointInRect([coords[counter][1], coords[counter][0]], bounds);
                    return <Rectangle bounds={bounds} key={[boundsStart, boundsEnd, inside, index]} color={ inside ? '#00ff00' : '#ff0000'} />
                })}
                {/* <Marker position={[coords[0][1], coords[0][0]]} icon={marker} /> */}
                <Marker position={[coords[counter][1], coords[counter][0]]} icon={marker} />
                {/* <Marker position={mousePos} icon={marker} /> */}
            </MapContainer>
        </div>


    )
}

export default MapDisplay;