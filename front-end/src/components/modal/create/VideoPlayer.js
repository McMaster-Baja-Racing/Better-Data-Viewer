import React, { useEffect, useRef, useState } from 'react';

const VideoPlayer = () => {
    
  const [videoURL, setVideoURL] = useState('');

  useEffect(() => {
    // Fetch data when the component mounts
    fetch(`http://${window.location.hostname}:8080/files/IMG_1012.mp4`)
      .then((response) => response.blob())
      .then((blob) => {
        setVideoURL(URL.createObjectURL(blob));
      });
  }, []); // Empty dependency array ensures that the fetch is only performed once

  return (
    <div>
      <video src={videoURL} autoPlay={true} />
    </div>
  );
};

export default VideoPlayer;