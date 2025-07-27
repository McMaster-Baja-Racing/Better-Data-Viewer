import styles from './Topbar.module.scss';
import { useState } from 'react';
import { ApiUtil } from '@lib/apiUtils';
import { onIconClick } from '@lib/navigationUtils';
import bajalogo from '@assets/baja_logo.svg';
import loadingImg from '@assets/loading.gif';
import { MAX_VIEWS } from '@components/legacy/views/viewsConfig';
import {
  sunIcon,
  moonIcon,
  liveOnIcon,
  liveOffIcon,
  mapIcon,
  newGraphIcon,
  uploadIcon,
  downloadIcon,
  helpIcon,
} from '@assets/icons';
import { useTheme } from '@contexts/ThemeContext';
import { showErrorToast, showSuccessToast } from '@components/ui/toastNotification/ToastNotification';

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
      showSuccessToast('Response', res.toString());
    }).catch((err) => {
      showErrorToast(err);
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
            ? <img className={styles.icon} src={sunIcon} alt="Light Mode" />
            : <img className={styles.icon} src={moonIcon} alt="Dark Mode" />}
        </button>
        
        <button title="Start Live Data" onClick={beginLiveData}>
          {liveStatus
            ? <img className={styles.icon} src={liveOnIcon} alt="Live Mode On" />
            : <img className={styles.icon} src={liveOffIcon} alt="Live Mode Off" />}
        </button>

        <button title="Go to map" onClick={() =>onIconClick('map')}>
          <img className={styles.icon} src={mapIcon} alt="Go to map" />
        </button>
        <button title="Choose Preset" className="choosePreset" onClick={() => setModal('ChoosePreset')}>
          <img className="icon"src={newGraphIcon} alt="Choose Preset" />
        </button>
        <button title="Upload Files" onClick={() => setModal('Upload')}>
          <img className={styles.icon} src={uploadIcon} alt="Upload" />
        </button>

        <button title="Download Files" onClick={() => setModal('Download')}>
          <img className={styles.icon} src={downloadIcon} alt="Download" />
        </button>

        <button title="PlusView" onClick={() => updateNumViews(numViews-1)}>
                    -
        </button>
        <h1>{numViews}</h1>
        <button title="MinusView" onClick={() => updateNumViews(numViews+1)}>
                    +
        </button>

        <button title="Help" onClick={() => setModal('Help')}>
          <img className={styles.icon} src={helpIcon} alt="Help" />
        </button>
      </div>
    </div>
  );
};

export default Topbar;