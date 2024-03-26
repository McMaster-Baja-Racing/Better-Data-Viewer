import '../styles/App.css';
import '../styles/views.css';
import { CreateGraphModal } from "./modal/create/CreateGraphModal";
import { UploadModal } from "./modal/upload/uploadModal";
import { HelpModal } from "./modal/help/helpModal";
import { DownloadModal } from './modal/download/downloadModal';
import React, { useEffect, useState } from 'react';
import Topbar from './Topbar';
import Views from './views/Views';
import $ from 'jquery';
import { MAX_VIEWS } from './views/viewsConfig';
import Chart from './views/Chart';

const App = () => {

  // State for holding which modal should be open
  const [modal, setModal] = useState('')
  const [numViews, setNumViews] = useState(1);
  const [videoTimestamp, setVideoTimestamp] = useState(0)
  const [selectedVideo, setSelectedVideo] = useState({ key: "", start: "", end: "" })

  // State for holding the information for each view
  const [viewInformation, setViewInformation] = useState(
    Array.from({ length: MAX_VIEWS }, () => ({
      component: Chart,
      props: {}
    }))
  )

  // This is an object so that other updates to it will always call the useEffect, even if the message is the same
  const [successMessage, setSuccessMessage] = useState({})
  const [buttonID, setButtonID] = useState(null);

  // Catches when success message is updated and displays it after removing old one
  useEffect(() => {
    if (successMessage === "" || Object.keys(successMessage).length === 0) return;
    $("div.success").hide().stop(true, false) // This could use some work to show that they are different messages more clearly
    $("div.success").slideDown(500).delay(2000).slideUp(1000);
  }, [successMessage]);

  return (
    <div className="App">
      <Topbar setModal={setModal} numViews={numViews} setNumViews={setNumViews} />
      <div className="App-body">
        <div className="success">{successMessage.message}</div>
        {modal === 'Create' ? <CreateGraphModal setModal={setModal} setViewInformation={setViewInformation} setSuccessMessage={setSuccessMessage} viewInformation={viewInformation} buttonID={buttonID} setNumViews={setNumViews} numViews={numViews} selectedVideo={selectedVideo} setSelectedVideo={setSelectedVideo}/> : null}
        {modal === 'Upload' ? <UploadModal setModal={setModal} setSuccessMessage={setSuccessMessage} /> : null}
        {modal === 'Download' ? <DownloadModal setModal={setModal} /> : null}
        {modal === 'Help' ? <HelpModal setModal={setModal} /> : null}

        <Views viewInformation={viewInformation} setModal={setModal} setButtonID={setButtonID} numViews={numViews} videoTimestamp={videoTimestamp} setVideoTimestamp={setVideoTimestamp} video={selectedVideo} />

      </div>

    </div>
  );
}

export default App;