import '../styles/topbar.css';
import { useState } from 'react';

const Topbar = ({ setModal }) => {

    const [liveStatus, setLiveStatus] = useState(false);
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

        if (liveStatus === false) {
            setLiveStatus(true);
        } else {
            setLiveStatus(false);
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
                <button title="Start Live Data" className="beginLive" onClick={beginLiveData}>
                    {liveStatus
                        ? <img className="icon" src={process.env.PUBLIC_URL + 'icons/liveOn.svg'} alt="Live Mode On" />
                        : <img className="icon" src={process.env.PUBLIC_URL + 'icons/liveOff.svg'} alt="Live Mode Off" />}
                </button>
                <button title="Create Graph" className="createGraph" onClick={() => setModal('Create')}>
                    <img className="icon" src={process.env.PUBLIC_URL + 'icons/newGraph2.svg'} alt="Create Graph" />
                </button>
                <button title="Upload Files" className="uploadFiles" onClick={() => setModal('Upload')}>
                <img className="icon"src={process.env.PUBLIC_URL + 'icons/upload.svg'} alt="Upload" />
                </button>
                <button title="Download Files" className="downloadFiles" onClick={() => setModal('Download')}>
                <img className="icon"src={process.env.PUBLIC_URL + 'icons/download.svg'} alt="Download" />
                </button>
                <button title="Help" className="helpModal" onClick={() => setModal('Help')}>
                    <img className="icon"src={process.env.PUBLIC_URL + 'icons/help.svg'} alt="Help" />
                </button>
            </div>
        </div>
    );
}

export default Topbar;