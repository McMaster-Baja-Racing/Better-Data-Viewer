import styles from './App.module.scss';
import { CreateGraphModal } from './modal/create/CreateGraphModal/CreateGraphModal';
import { UploadModal } from './modal/upload/UploadModal';
import { HelpModal } from './modal/help/helpModal';
import { DownloadModal } from './modal/download/DownloadModal';
import { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Topbar from './Topbar/Topbar';
import Views from './views/Views/Views';
import { MAX_VIEWS } from './views/viewsConfig';
import Chart from './views/Chart/Chart';
import MapChart from './map/MapChart/MapChart';
import cx from 'classnames';
import ModelViewer from './model/ModelViewer';
import { Accordion } from './accordion/Accordion';
import { OptionSquare } from './optionSquare/OptionSquare';
import defaultImage from '@assets/preset_thumbnail.png';


const App = () => {
  const location = useLocation();

  // State for holding which modal should be open
  const [modal, setModal] = useState('');
  const [numViews, setNumViews] = useState(1);
  const [videoTimestamp, setVideoTimestamp] = useState(0);
  const [video, setVideo] = useState({ key: '', start: '', end: '' });
  const [isVisible, setIsVisible] = useState(false);

  // State for holding the information for each view
  const [viewInformation, setViewInformation] = useState(
    Array.from({ length: MAX_VIEWS }, () => ({
      component: Chart,
      props: {}
    }))
  );

  // This is an object so that other updates to it will always call the useEffect, even if the message is the same
  const [successMessage, setSuccessMessage] = useState<{message: string}>({message: ''});
  const [buttonID, setButtonID] = useState(null);

  // Catches when success message is updated and displays it after removing old one
  useEffect(() => {
    if (successMessage.message == '') return;
    // TODO: This could use some work to show that they are different messages more clearly
    setIsVisible(true);
    const timer = setTimeout(() => setIsVisible(false), 2000);

    return () => clearTimeout(timer); 
  }, [successMessage]);

  return (
    // I'll put it back!!! I swear it's just for testing on a dark bg don't kill me!!!!!!
    <div className={styles.App}>
      {location.pathname !== "/" && (
        <Topbar
          setModal={setModal}
          numViews={numViews}
          setNumViews={setNumViews}
        />
      )}
      <Accordion title="Label">
        <OptionSquare label="Label" illustration={defaultImage} />
        <OptionSquare label="Label" illustration={defaultImage} />
        <OptionSquare label="Label" illustration={defaultImage} />
        <OptionSquare label="Label" illustration={defaultImage} />
        <OptionSquare label="Label" illustration={defaultImage} />
        <OptionSquare label="Label" illustration={defaultImage} />
        <OptionSquare label="Label" illustration={defaultImage} />
        <OptionSquare label="Label" illustration={defaultImage} />
        <OptionSquare label="Label" illustration={defaultImage} />
        <OptionSquare label="Label" illustration={defaultImage} />
      </Accordion>
    </div>
  );

};

export default App;
