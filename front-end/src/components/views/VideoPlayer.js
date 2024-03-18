import React, { useEffect, useRef, useState } from 'react';
import '../../styles/videoPlayerStyles.css';
import { getDuration } from '../../lib/videoUtils';

const VideoPlayer = (videoInformation) => {

  const [videoURL, setVideoURL] = useState('');
  const videoRef = useRef(null);
  const duration = getDuration(videoInformation);

  useEffect(() => {
    // Fetch data when the component mounts
    fetch(`http://${window.location.hostname}:8080/files/${videoInformation.video.key}`)
      .then((response) => response.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob) 
        setVideoURL(url);

        return () => {
          URL.revokeObjectURL(url);
        };
      });
  }, []); // Empty dependency array ensures that the fetch is only performed once

  const togglePlay = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  const formatTime = (seconds) => {  // the time display, converting past time to minutes
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };


  const seek = (event) => {
    const seekTime = event.target.value;
    videoRef.current.currentTime = seekTime;
  };

  const updateTimestamp = () => {
    videoInformation.setVideoTimestamp(videoRef.current.currentTime);
  }

  return (
    <div className = "background">
        <div className = "pageWrap">
          <div className = "pageContainer">
            <div className = "videoContainerBox">
              <video src={videoURL} videRef={videoRef} onTimeUpdate={updateTimestamp} onClick={togglePlay} className = "center" id="video"/>
            </div>
            <div className="timeDisplay">
              {formatTime(videoInformation.videoTimestamp)} / {formatTime(videoRef.current ? videoRef.current.duration : 0)}
            </div>
            <input type="range" min="0" max={duration} value={videoInformation.videoTimestamp} onChange={seek} className="seekbar" />
          </div>
        </div>
    </div>
  );
};

export default VideoPlayer;