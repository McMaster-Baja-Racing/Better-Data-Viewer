import React, { useEffect, useRef, useState } from 'react';
import '../../../styles/videoPlayerStyles.css';

const VideoPlayer = () => {

  useEffect(() => {
    // Fetch data when the component mounts
    fetch(`http://${window.location.hostname}:8080/files/IMG_1012.mp4`)
      .then((response) => response.blob())
      .then((blob) => {
        setVideoURL(URL.createObjectURL(blob));
      });
  }, []); // Empty dependency array ensures that the fetch is only performed once

  
  const [videoURL, setVideoURL] = useState('');
  const videoRef = useRef(null);

  const togglePlay = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  }

  return (
    <div>
      <video src={videoURL} ref={videoRef} onClick={togglePlay} />
    </div>
  );
};

export default VideoPlayer;