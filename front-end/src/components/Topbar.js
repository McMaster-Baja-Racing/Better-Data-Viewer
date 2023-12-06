import '../styles/topbar.css';
import { useState } from 'react';

const Topbar = ({ openCreateGraphModal, openUploadModal, openHelpModal, setSuccessMessage}) => {

    const [liveStatus, setLiveStatus] = useState("Begin Live Data");
    //This function notifies the backend to begin listening on a certain port for live data
    var formData = new FormData();
    //formData.append("port", "COM2");
    const beginLiveData = () => {
        fetch(`http://${window.location.hostname}:8080/live`, {
            method: "POST",
            body: formData,
        }).then((res) => res.text()).then((res) =>{
            console.log(res);
            //if the response contains started or stopped, then the live data has been started or stopped and the button should be updated
            if (res.includes("started")) {
                setLiveStatus("Stop Live Data");
                setSuccessMessage({ message: "Live Data Started" });
            } else if (res.includes("stopped")) {
                setLiveStatus("Begin Live Data");
                setSuccessMessage({ message: "Live Data Stopped" });
            }
            else {
                console.log("Error: " + res);
                
                setSuccessMessage({ message: "Live Data Error" });
            }
        }).catch((err) => {
            console.log(err);
        });
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
                <button className="createGraph" onClick={openCreateGraphModal}>Create Graph</button>
                <button className="createGraph" onClick={openUploadModal}>Upload Files</button>
                <button className="helpModal" onClick={openHelpModal}>Help</button>
            </div>
        </div>
    );
}

export default Topbar;