import React, { useEffect, useState } from 'react';
import '../../styles/videoPlayerStyles.css';
import ReactPlayer from 'react-player';
import { ApiUtil } from '../../lib/apiUtils';

const VideoPlayer = ({ video, videoTimestamp, setVideoTimestamp }) => {

  const [videoURL, setVideoURL] = useState('');

  useEffect(() => {
    // Fetch data when the component mounts
    ApiUtil.getFile(video.key)
      .then((response) => response.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob) 
        setVideoURL(url);

        return () => {
          URL.revokeObjectURL(url);
        };
      });
  }, []); // Empty dependency array ensures that the fetch is only performed once

  return (
    <div className = "background">
        <div className = "pageWrap">
          <div className = "pageContainer">
            <div className = "videoContainerBox">
              <ReactPlayer url={videoURL} onProgress={(e) => {setVideoTimestamp(e.playedSeconds*1000)}} progressInterval={1} className="center" id="video" controls/>
            </div>
          </div>
        </div>
    </div>
  );
};

export default VideoPlayer;