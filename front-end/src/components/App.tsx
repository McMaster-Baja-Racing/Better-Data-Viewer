import styles from './App.module.scss';
import { CreateGraphModal } from './legacy/modal/create/CreateGraphModal/CreateGraphModal';
import { SimpleCreateGraphModal } from './legacy/modal/create/SimpleCreateGraphModal/SimpleCreateGraphModal.js';
import { UploadModal } from './legacy/modal/upload/UploadModal';
import { HelpModal } from './legacy/modal/help/helpModal';
import { DownloadModal } from './legacy/modal/download/DownloadModal';
import { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Topbar from './legacy/Topbar/Topbar';
import Views from './legacy/views/Views/Views';
import { MAX_VIEWS } from './legacy/views/viewsConfig';
import Chart from './legacy/views/Chart/Chart';
import MapChart from './legacy/map/MapChart/MapChart';
import cx from 'classnames';
import ModelViewer from './legacy/model/ModelViewer';
import { Homepage } from '@pages/Homepage/Homepage';
import Sidebar from './simple/sidebar/Sidebar';
import { DataView } from '@pages/DataView/DataView';

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

  // Temp variable to maintain old styling on /old
  const isNew = location.pathname == '/' || location.pathname == '/dataview';

  return (
    <div className={cx(styles.App, { [styles.new]: isNew })}>
      {isNew ? <Sidebar setModal={setModal}/> : (
        <Topbar setModal={setModal} numViews={numViews} setNumViews={setNumViews} />
        
      )}
      <header className={styles.Body}>
        <div className={cx(styles.success, { [styles.visible]: isVisible })}>
          {successMessage.message}
        </div>

        {modal === 'Create' ? (
          <CreateGraphModal
            setModal={setModal}
            setViewInformation={setViewInformation}
            setSuccessMessage={setSuccessMessage}
            viewInformation={viewInformation}
            buttonID={buttonID}
            setNumViews={setNumViews}
            numViews={numViews}
            video={video}
            setVideo={setVideo}
          />
        ) : null}
        {modal === 'ChoosePreset' ? (
          <SimpleCreateGraphModal
            setModal={setModal}
            setViewInformation={setViewInformation}
            viewInformation={viewInformation}
            setNumViews={setNumViews}
          />
        ) : null}
        {modal === 'Upload' ? (
          <UploadModal
            setModal={setModal}
            setSuccessMessage={setSuccessMessage}
          />
        ) : null}
        {modal === 'Download' ? <DownloadModal setModal={setModal} /> : null}
        {modal === 'Help' ? <HelpModal setModal={setModal} /> : null}
        <Routes>
          <Route path="*" element={<Homepage />}/>
          <Route path="/dataview" element={<DataView />} />
          <Route path="/map" element={<MapChart />} />
          <Route path="/IMU" element={<ModelViewer />} />
          <Route
            path="/old"
            element={
              <Views
                viewInformation={viewInformation}
                setModal={setModal}
                setButtonID={setButtonID}
                numViews={numViews}
                videoTimestamp={videoTimestamp}
                setVideoTimestamp={setVideoTimestamp}
                video={video}
              />
            }
          />
        </Routes>
      </header>
    </div>
  );

};

export default App;