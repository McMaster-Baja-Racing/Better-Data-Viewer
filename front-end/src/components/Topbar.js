import '../styles/topbar.css';
import { useState } from 'react';

const Topbar = ({ setModal }) => {

    const [liveStatus, setLiveStatus] = useState("Begin Live Data");
    //This function notifies the backend to begin listening on a certain port for live data
    var formData = new FormData();
    formData.append("port", "COM2");
    const beginLiveData = () => {
        fetch(`http://${window.location.hostname}:8080/live`, {
            method: "POST",
            body: formData,
        }).then((res) => {
            console.log(res);
        }).catch((err) => {
            console.log(err);
        });

        if (liveStatus === "Begin Live Data") {
            setLiveStatus("Stop Live Data");
        } else {
            setLiveStatus("Begin Live Data");
        }
    }

    return (
        <div className="topbar">
            <div className="title">
                <img src={process.env.PUBLIC_URL + 'bajalogo.png'} alt="baja_logo"/>
                Data Visualizer
                <img src={process.env.PUBLIC_URL + 'eeee.gif'} alt="baja_logo"/>
            </div>
            <div className="buttons">
                <button className="beginLive" onClick={beginLiveData}>{liveStatus}</button>
                <button className="createGraph" onClick={() => setModal('Create')}>Create Graph</button>
                <button className="uploadFiles" onClick={() => setModal('Upload')}>Upload Files</button>
                <button className="downloadFiles" onClick={() => setModal('Download')}>Download Files</button>
                <button className="helpModal" onClick={() => setModal('Help')}>Help</button>
            </div>
        </div>
    );
}

export default Topbar;