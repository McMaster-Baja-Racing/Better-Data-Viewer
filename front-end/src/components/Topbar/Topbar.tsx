import './Topbar.css';
import React, { useState } from 'react';
import { ApiUtil } from '@lib/apiUtils.js';
import bajalogo from '@assets/bajalogo.png';
import loadingImg from '@assets/loading.gif';
import { MAX_VIEWS } from '@components/views/viewsConfig.js';
import { icons } from '@lib/assets';

interface TopbarProps {
  numViews: number;
  setNumViews: (num: number) => void;
  setModal: (modal: string) => void;
}

const Topbar = ({ setModal, numViews, setNumViews }: TopbarProps) => {

  const [liveStatus, setLiveStatus] = useState(false);
  //This function notifies the backend to begin listening on a certain port for live data
  const beginLiveData = () => {

    ApiUtil.toggleLiveData('COM2').then((res) => {
      console.log(res);
    }).catch((err) => {
      console.log(err);
    });

    if (liveStatus === false) {
      setLiveStatus(true);
    } else {
      setLiveStatus(false);
    }
  };

  const updateNumViews = (num) => {
    if (num < 1) {
      num = 1;
    }
    if (num > MAX_VIEWS) {
      num = MAX_VIEWS;
    }
    setNumViews(num);
  };

  return (
    <div className="topbar">
      <div className="title" onClick={() => window.location.href='/'}>
        <img src={bajalogo} alt="baja_logo"/>
                Data Visualizer
        <img src={loadingImg} alt="loading"/>
      </div>
      <div className="buttons">
        <button title="Start Live Data" className="beginLive" onClick={beginLiveData}>
          {liveStatus
            ? <img className="icon" src={icons['liveOn']} alt="Live Mode On" />
            : <img className="icon" src={icons['liveOff']} alt="Live Mode Off" />}
        </button>

        <button title="Go to map" className="map" onClick={() => window.location.href='/map'}>
          <img className="icon" src={icons['map']} alt="Go to map" />
        </button>
                
        <button title="Upload Files" className="uploadFiles" onClick={() => setModal('Upload')}>
          <img className="icon"src={icons['upload']} alt="Upload" />
        </button>

        <button title="Download Files" className="downloadFiles" onClick={() => setModal('Download')}>
          <img className="icon"src={icons['download']} alt="Download" />
        </button>

        <button title="PlusView" className="plusView" onClick={() => updateNumViews(numViews-1)}>
                    -
        </button>
        <h1>{numViews}</h1>
        <button title="MinusView" className="minusView" onClick={() => updateNumViews(numViews+1)}>
                    +
        </button>

        <button title="Help" className="helpModal" onClick={() => setModal('Help')}>
          <img className="icon"src={icons['help']} alt="Help" />
        </button>
      </div>
    </div>
  );
};

export default Topbar;