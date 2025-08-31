import styles from './App.module.scss';
import { Routes, Route } from 'react-router-dom';
import MapChart from '../../components/legacy/map/MapChart/MapChart';
import cx from 'classnames';
import ModelViewer from '../../components/legacy/model/ModelViewer';
import { Homepage } from '@pages/Homepage/Homepage';
import Sidebar from '../../components/simple/sidebar/Sidebar';
import { DataView } from '@pages/DataView/DataView';
import { ToastNotification } from '@components/ui/toastNotification/ToastNotification';
import { useFiles } from '@lib/files/useFiles';

const App = () => {
  useFiles(); // Fetch files on app load

  return (
    <div className={cx(styles.App)}>
      <ToastNotification />
      <Sidebar/>
      <header className={styles.Body}>
        <Routes>
          <Route path="*" element={<Homepage />}/>
          <Route path="/dataview" element={<DataView />} />
          <Route path="/map" element={<MapChart />} />
          <Route path="/IMU" element={<ModelViewer />} />
        </Routes>
      </header>
    </div>
  );

};

export default App;