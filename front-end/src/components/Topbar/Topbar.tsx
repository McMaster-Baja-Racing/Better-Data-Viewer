import styles from './Topbar.module.scss';
import { useState } from 'react';
import { ApiUtil } from '@lib/apiUtils';
import { onIconClick } from '@lib/navigationUtils';
import bajalogo from '@assets/bajalogo.png';
import loadingImg from '@assets/loading.gif';
import { MAX_VIEWS } from '@components/views/viewsConfig';
import { icons } from '@lib/assets';
import { useTheme } from '../../ThemeContext';

interface TopbarProps {
  numViews: number;
  setNumViews: (num: number) => void;
  setModal: (modal: string) => void;
}

const Topbar = ({ setModal, numViews, setNumViews }: TopbarProps) => {
  const { theme, toggleTheme } = useTheme();

  const [liveStatus, setLiveStatus] = useState(false);
  //This function notifies the backend to begin listening on a certain port for live data
  const beginLiveData = () => {

    ApiUtil.toggleLiveData('COM2').then((res) => {
      alert(res);
    }).catch((err) => {
      alert(err);
    });

    setLiveStatus(!liveStatus);
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
    <div className={styles.topbar}>
      <div className={styles.title} onClick={() => onIconClick('')}>
        <img src={bajalogo} alt="baja_logo"/>
                Data Visualizer
        <img src={loadingImg} alt="loading"/>
      </div>
      <div className={styles.buttons}>
        <button title="Toggle Theme" onClick={toggleTheme}>
          {theme === 'dark'
            ? <img className={styles.icon} src={icons['sun']} alt="Light Mode" />
            : <img className={styles.icon} src={icons['moon']} alt="Dark Mode" />}
        </button>
        
        <button title="Start Live Data" onClick={beginLiveData}>
          {liveStatus
            ? <img className={styles.icon} src={icons['liveOn']} alt="Live Mode On" />
            : <img className={styles.icon} src={icons['liveOff']} alt="Live Mode Off" />}
        </button>

        <button title="Go to map" onClick={() =>onIconClick('map')}>
          <img className={styles.icon} src={icons['map']} alt="Go to map" />
        </button>
                
        <button title="Upload Files" onClick={() => setModal('Upload')}>
          <img className={styles.icon} src={icons['upload']} alt="Upload" />
        </button>

        <button title="Download Files" onClick={() => setModal('Download')}>
          <img className={styles.icon} src={icons['download']} alt="Download" />
        </button>

        <button title="PlusView" onClick={() => updateNumViews(numViews-1)}>
                    -
        </button>
        <h1>{numViews}</h1>
        <button title="MinusView" onClick={() => updateNumViews(numViews+1)}>
                    +
        </button>

        <button title="Help" onClick={() => setModal('Help')}>
          <img className={styles.icon} src={icons['help']} alt="Help" />
        </button>
      </div>
    </div>
  );
};

export default Topbar;