import React, { useEffect, useRef, useState } from 'react';
import '../../styles/videoPlayerStyles.css';
import { getDuration } from '../../lib/videoUtils';
import ReactPlayer from 'react-player';

const VideoPlayer = ({ video, videoTimestamp, setVideoTimestamp }) => {

  const [videoURL, setVideoURL] = useState('');

  useEffect(() => {
    // Fetch data when the component mounts
    fetch(`http://${window.location.hostname}:8080/files/${video.key}`)
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