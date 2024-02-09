import { MapContainer, TileLayer, Marker, Popup, Rectangle, GeoJSON, useMapEvents } from 'react-leaflet';
import L, { point } from "leaflet";
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';


const ENTER = "enter";
const EXIT = "exit";

function getBounds(coords) {
    /**
     * Gets the bounding box that surrounds a list of coordinates
     * @param {Array} coords - a list of coordinates in [long, lat] format
     */
    let minLat = Infinity, minLng = Infinity, maxLat = -Infinity, maxLng = -Infinity;
    coords.forEach(elem => {
        if(elem[1] > maxLat) maxLat = elem[0];
        if(elem[1] < minLat) minLat = elem[0];
        if(elem[0] > maxLng) maxLng = elem[1];
        if(elem[0] < minLng) minLng = elem[1];
    });
    // Add some margin on sides so the line isn't right on the edge of the screen
    let latMargin = (maxLat - minLat)*0.5;
    let lngMargin = (maxLng - minLng)*0.5;
    return [[minLng - lngMargin, minLat - latMargin], [maxLng+lngMargin, maxLat+latMargin]];
}

function boundaryEvent(event, rect, time) {
    return {event: event, rect: rect, time: time};
}

function pointInRect(point, bounds) {
    if (!bounds) return false;
    if (!point) return false;
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

function findLapTimes(coords, rects) {
    let inside = false;
    let events = [];
    for(let i = 0; i < coords.length; i++) {
        for(let [index, elem] of rects.entries()) {
            if(!inside && pointInRect([coords[i][1], coords[i][0]], elem.bounds)) {
                inside = true;
                events.push(boundaryEvent(ENTER, index, coords[i][2]));
            }
            else if (inside && events[events.length - 1].rect === index && !pointInRect([coords[i][1], coords[i][0]], elem.bounds)) {
                inside = false;
                events.push(boundaryEvent(EXIT, index, coords[i][2]));
            }
        }
    }
    let laps = [];
    let currLap = {start: 0, end: 0, checkpoints: []};
    for(let event of events) {
        if(event.event === EXIT && rects[event.rect].type === "Start" ) {
            currLap.start = event.time;
        }
        else if(event.event === ENTER && rects[event.rect].type === "End" ) {
            currLap.end = event.time;
            laps.push(currLap);
            currLap = {};
        }
        else if(event.event === ENTER && rects[event.rect].type === "Checkpoint") {
            currLap.checkpoints.push(event.time);
        }
        console.log(event.time, ": " +event.event + " " + rects[event.rect].type + " " + event.rect);
    }
    console.log(laps);
}

const MapDisplay = ({ coords, toolType }) => {

    const bounds = getBounds(coords);

    const [counter, setCounter] = useState(0);
    const [drawing, setDrawing] = useState(false);
    const [boundsStart, setBoundsStart] = useState([0, 0]);
    const [boundsEnd, setBoundsEnd] = useState([0, 0]);
    const [rects, setRects] = useState([]);
    const [events, setEvents] = useState([]);

    // useEffect(() => {
    //     const timerId = setInterval(() => {
    //         setCounter(counter + 1);
    //         if (counter >= coords.length - 1) {
    //             setCounter(0);
    //             setEvents([]);
    //         }
    //         let newEvents = [];
    //         rects.forEach(elem => {
    //             if(pointInRect([coords[counter][1], coords[counter][0]], elem)) {
    //                 if(events.length === 0 || (events[events.length - 1].event === EXIT && events[events.length - 1].rect !== elem)) {
    //                     if(events.length > 0 && events[events.length - 1].event === EXIT) {
    //                         console.log("Time between blocks:", coords[counter][2] - events[events.length - 1].time);
    //                     }
    //                     newEvents.push(boundaryEvent(ENTER, elem, coords[counter][2]));
    //                 }
    //             } else {
    //                 if(events.length > 0 && events[events.length - 1].event === ENTER && events[events.length - 1].rect === elem) {
    //                     newEvents.push(boundaryEvent(EXIT, elem, coords[counter][2]));
    //                     console.log("exit???", newEvents[newEvents.length - 1])
    //                 }
    //             }
    //         })
    //         if(newEvents.length > 0) setEvents([...events, newEvents]);
    //     }, 5)
    //     return () => clearInterval(timerId);
    // });

    const MapEvents = () => {
        useMapEvents({
            mousemove(e) {
                if (drawing) {
                    setBoundsEnd([e.latlng.lat, e.latlng.lng]);
                }
            },
            mousedown(e) {
                // only right click
                if(e.originalEvent.button !== 2) return;
                e.originalEvent.preventDefault();
                if(drawing) return;
                setDrawing(true);
                setBoundsStart([e.latlng.lat, e.latlng.lng]);
                setBoundsEnd([e.latlng.lat, e.latlng.lng]);
            },
            mouseup(e) {
                if(e.originalEvent.button !== 2) return;
                e.originalEvent.preventDefault();
                if(!drawing) return;
                setDrawing(false);
                setBoundsEnd([e.latlng.lat, e.latlng.lng]);
                setRects((old) => [...old, {bounds: [boundsStart, boundsEnd], type: toolType}])
            },
            contextmenu(e) {
                // Disable right click menu on the map
                return false;
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



    const marker = L.icon({ iconUrl: "/topdown.png", shadowUrl: "https://unpkg.com/leaflet@1.5.1/dist/images/marker-shadow.png", iconSize: [50, 50], iconAnchor: [25, 25] })
    return (
        <div id="mapBackground" style={{ height: "100%", width: "100%" }}>
            <button onClick={() => findLapTimes(coords, rects)}> analyze </button>
            <MapContainer bounds={bounds} style={{ height: "100%", width: "100%" }} dragging={true} scrollWheelZoom={true} >
                <GeoJSON key={testLine} data={testLine} style={{ stroke: true, color: "#2222ff", weight: 5 }}></GeoJSON>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                    subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                    maxZoom={20}
                />
                <MapEvents />
                {drawing ? <Rectangle bounds={[boundsStart, boundsEnd]} /> : null}
                {rects.map((rect, index) => {
                    let inside = pointInRect([coords[counter][1], coords[counter][0]], rect.bounds);
                    return <Rectangle bounds={rect.bounds} key={[rect.bounds]} color={ inside ? '#00ff00' : '#ff0000'} />
                })}
                {/* <Marker position={[coords[0][1], coords[0][0]]} icon={marker} /> */}
                <Marker position={[coords[counter][1], coords[counter][0]]} icon={marker} />
                {/* <Marker position={mousePos} icon={marker} /> */}
            </MapContainer>
        </div>


    )
}

export default MapDisplay;