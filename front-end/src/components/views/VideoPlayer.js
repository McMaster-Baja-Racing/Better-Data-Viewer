import React, { useEffect, useRef, useState } from 'react';
import '../../styles/videoPlayerStyles.css';
import { getDuration } from '../../lib/videoUtils';

const VideoPlayer = ( videoInformation ) => {

  const [videoURL, setVideoURL] = useState('');
  const videoRef = useRef(null);
  const [key, setKey] = useState(undefined);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    // Fetch data when the component mounts
    if (key === undefined) return;
    fetch(`http://${window.location.hostname}:8080/files/${key}`)
      .then((response) => response.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob) 
        setVideoURL(url);

        return () => {
          URL.revokeObjectURL(url);
        };
      });
  }, [key]); // Empty dependency array ensures that the fetch is only performed once

  useEffect(() => {
    setKey(videoInformation.video.key);
    setDuration(getDuration(videoInformation));
  }, [videoInformation]);

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
    const time = videoRef.current.currentTime;
    setCurrentTime(time);
    // videoInformation.setVideoTimestamp(time * 1000);
  }

  return (
    <div className = "background">
        <div className = "pageWrap">
          <div className = "pageContainer">
            <div className = "videoContainerBox">
              <video src={videoURL} ref={videoRef} onTimeUpdate={updateTimestamp} onClick={togglePlay} className = "center" id="video"/>
            </div>
            <div className="timeDisplay">
              {formatTime(videoInformation.videoTimestamp)} / {formatTime(videoRef.current ? videoRef.current.duration : 0)}
            </div>
            <input type="range" min="0" max={duration} value={currentTime} onChange={seek} className="seekbar" />
          </div>
        </div>
    </div>
  );
};

export default VideoPlayer;