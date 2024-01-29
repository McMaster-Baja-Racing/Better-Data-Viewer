import '../styles/topbar.css';
import { useState } from 'react';
import { ApiUtil } from '../lib/apiUtils.js';
import bajalogo from '../assets/bajalogo.png';
import loadingImg from '../assets/loading.gif';

const icons = {};
const importAll = r => {
    r.keys().forEach(key => icons[key] = r(key));
}
importAll(require.context('../assets/icons', false, /\.(png|jpe?g|svg)$/));

const Topbar = ({ setModal }) => {

    const [liveStatus, setLiveStatus] = useState(false);
    //This function notifies the backend to begin listening on a certain port for live data
    const beginLiveData = () => {

        ApiUtil.toggleLiveData("COM2").then((res) => {
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
                <img src={bajalogo} alt="baja_logo"/>
                Data Visualizer
                <img src={loadingImg} alt="loading"/>
            </div>
            <div className="buttons">
                <button title="Start Live Data" className="beginLive" onClick={beginLiveData}>
                    {liveStatus
                        ? <img className="icon" src={icons['./liveOn.svg']} alt="Live Mode On" />
                        : <img className="icon" src={icons['./liveOff.svg']} alt="Live Mode Off" />}
                </button>
                
                <button title="Upload Files" className="uploadFiles" onClick={() => setModal('Upload')}>
                <img className="icon"src={icons['./upload.svg']} alt="Upload" />
                </button>
                <button title="Download Files" className="downloadFiles" onClick={() => setModal('Download')}>
                <img className="icon"src={icons['./download.svg']} alt="Download" />
                </button>
                <button title="Help" className="helpModal" onClick={() => setModal('Help')}>
                    <img className="icon"src={icons['./help.svg']} alt="Help" />
                </button>
            </div>
        </div>
    );
}

export default Topbar;