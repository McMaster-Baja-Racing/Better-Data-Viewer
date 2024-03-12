import { MapContainer, TileLayer, Marker, Rectangle, GeoJSON, useMapEvents } from 'react-leaflet';
import L from "leaflet";
import 'leaflet/dist/leaflet.css';
import '../../styles/mapDisplay.css';
import { useEffect, useState } from 'react';
import ToolSelection from './ToolSelection';
import { getBounds, findLapTimes, pointInRect } from '../../lib/mapUtils';
import { LNG_INDEX, LAT_INDEX, TIME_INDEX, tools, LNG_COLUMNNAME, LAT_COLUMNNAME } from '../../lib/mapOptions';

const MapDisplay = ({ setLapsCallback, gotoTime }) => {

    const [coords, setCoords] = useState([]);
    const [bounds, setBounds] = useState([]);
    const [counter, setCounter] = useState(0);
    const [drawing, setDrawing] = useState(false);
    const [boundsStart, setBoundsStart] = useState([0, 0]);
    const [boundsEnd, setBoundsEnd] = useState([0, 0]);
    const [rects, setRects] = useState([]);
    const [currTool, setCurrTool] = useState(0);
    const [files, setFiles] = useState([]);

    // Move car around track
    useEffect(() => {
        const timerId = setInterval(() => {
            setCounter(counter + 1);
            if (counter >= coords.length - 1) {
                setCounter(0);
            }
        }, 5)
        return () => clearInterval(timerId);
    });

    // Re-zoom map when coords change
    useEffect(() => {
        if (coords.length === 0) return;
        setBounds(getBounds(coords));
        // console.log("new bounds!")
    }, [coords])

    // Go to selected lap in animation
    useEffect(() => {
        for (let i = 0; i < coords.length; i++) {
            if (coords[i][TIME_INDEX] >= gotoTime) {
                // console.log("Going to time", gotoTime, "at pos", i);
                setCounter(i);
                break;
            }

        }
    }, [gotoTime, coords]);

    useEffect(() => {
        fetch(`http://${window.location.hostname}:8080/files`)
            .then((response) => response.json())
            .then((json) => {
                let prefixes = [];
                for (let file of json.files) {
                    let prefix = file.key.split("/")[0];
                    if (!prefixes.includes(prefix)) {
                        prefixes.push(prefix);
                    }
                }
                setFiles(prefixes);
                // console.log(prefixes)
            });
    }, [])

    // Update the laps sidebar if the coords or rects changes
    useEffect(() => {
        setLapsCallback(findLapTimes(coords, rects))
    }, [coords, rects, setLapsCallback])

    const MapEvents = () => {
        useMapEvents({
            mousemove(e) {
                if (drawing) {
                    setBoundsEnd([e.latlng.lat, e.latlng.lng]);
                }
            },
            mousedown(e) {
                // only right click or ctrl-click or touchpad users
                if (e.originalEvent.button !== 2 && !e.originalEvent.ctrlKey) return;
                e.originalEvent.preventDefault();
                e.target.dragging.disable();
                if (drawing) return;
                setDrawing(true);
                setBoundsStart([e.latlng.lat, e.latlng.lng]);
                setBoundsEnd([e.latlng.lat, e.latlng.lng]);
            },
            mouseup(e) {
                // only right click or ctrl-click or touchpad users
                // if (e.originalEvent.button !== 2 && !e.originalEvent.ctrlKey) return;
                e.originalEvent.preventDefault();
                e.target.dragging.enable();
                if (!drawing) return;
                setDrawing(false);
                setBoundsEnd([e.latlng.lat, e.latlng.lng]);
                // Update list of rects
                setRects((old) => [...old, { bounds: [boundsStart, boundsEnd], type: tools[currTool] }]);
                // When finished placing one tool, go to the next automatically
                if (currTool === 0) {
                    setCurrTool(1);
                } else if (currTool === 1) {
                    setCurrTool(2);
                }

            },
            contextmenu(e) {
                // Disable right click menu on the map
                return false;
            }
        });
        return false;
    }

    function loadFile(e) {
        setCoords([]);
        setBounds([]);
        let chosen = e.target.value;
        // console.log(chosen);
        fetch(`http://${window.location.hostname}:8080/analyze?` + new URLSearchParams({
            inputFiles: `${chosen}/${LAT_COLUMNNAME}.csv,${chosen}/${LNG_COLUMNNAME}.csv`,
            inputColumns: `${LAT_COLUMNNAME}, ${LNG_COLUMNNAME}`,
            outputFiles: '',
            analyzer: 'interpolaterPro',
            liveOptions: 'false'
        }), {
            method: 'GET'
        }).then((response) => response.text())
            .then(text => {
                const lines = text.trim().split("\n").map((line) => line.split(","));
                setCoords(lines.slice(1).map(c => c.map(p => parseFloat(p))));
                // console.log(lines)
            });
    }

    // GEOJSON USES LONG, LAT NOT LAT, LONG

    const marker = L.icon({ iconUrl: "/topdown_outline.png", shadowUrl: "https://unpkg.com/leaflet@1.5.1/dist/images/marker-shadow.png", iconSize: [50, 50], iconAnchor: [25, 25] })
    return (
        <div id="mapBackground">
            <select className="map_ui_select" defaultValue="none" onChange={loadFile}>
                <option value="none" selected disabled hidden>Select a file to analyze</option>
                {files.map((f) => {
                    return (<option key={f} value={f}>{f}</option>);
                })}
            </select>
            <ToolSelection options={tools} setSelected={setCurrTool} selected={currTool}> </ToolSelection>
            {/* <button onClick={() => setLapsCallback(findLapTimes(coords, rects))} className="map_ui_button"> Analyze </button> */}
            <button onClick={() => setRects([])} className="map_ui_button">Clear</button>

            {bounds.length > 0 && coords.length > 0 ?
                // Inline style here because these are Leaflet components
                <MapContainer key={bounds} bounds={bounds} style={{ height: "100%", width: "100%", zIndex: "0" }} dragging={true} scrollWheelZoom={true} >
                    <GeoJSON key={coords[0]} data={[{
                        type: "LineString",
                        coordinates: coords.map(c => [c[LNG_INDEX], c[LAT_INDEX]])
                    },
                    ]} style={{ stroke: true, color: "#2222ff", weight: 1 }}></GeoJSON>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                        subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                        maxZoom={20}
                    />
                    <MapEvents />
                    {drawing ? <Rectangle bounds={[boundsStart, boundsEnd]} /> : null}
                    {rects.map((rect, index) => {
                        let inside = pointInRect([coords[counter][LAT_INDEX], coords[counter][LNG_INDEX]], rect.bounds);
                        let fillColor;
                        switch (rect.type) {
                            case "Start":
                                fillColor = "#00ff00";
                                break;
                            case "End":
                                fillColor = "#ff0000";
                                break;
                            case "Checkpoint":
                                fillColor = "#0000ff";
                                break;
                            default:
                                break;
                        }
                        return <Rectangle className="map_ui_rect" bounds={rect.bounds} key={[rect.bounds, inside]} color={inside ? '#00ff00' : '#000000'} fillColor={fillColor} eventHandlers={{
                            click: (e) => {
                                setRects(rects.toSpliced(index, 1));
                            }
                        }} />
                    })}
                    {/* <Marker position={[coords[0][1], coords[0][0]]} icon={marker} /> */}
                    <Marker position={[coords[counter][LAT_INDEX], coords[counter][LNG_INDEX]]} icon={marker} />
                    {/* <Marker position={mousePos} icon={marker} /> */}
                </MapContainer>
                : <></>
            }

        </div>


    )
}

export default MapDisplay;