import ReactDom from 'react-dom';
import '../../../styles/modalStyles.css';
import '../../../styles/downloadModalStyles.css';
import React, { useState, useRef, useEffect } from 'react';
import FileStorage from '../FileStorage.jsx';
import JSZip from 'jszip';
import { ApiUtil } from '../../../lib/apiUtils.js';

export const DownloadModal = ({ setModal }) => {
  const [selectedFiles, setSelectedFiles] = useState([]); // the files that the user has selected from the file menu
  const [files, setFiles] = useState([]); // holds all the files which have been uploaded

  useEffect(() => {
    // Fetch data when the component mounts
    ApiUtil.getFolder('csv')
      .then((response) => response.json())
      .then((data) => {
        setFiles(data);
      });
  }, []); // Empty dependency array ensures that the fetch is only performed once
  
  const modalRef = useRef();
  const closeModal = (e) => {
    if (e.target === modalRef.current) {
      setModal('');
    }
  };

  const downloadFiles = async () => {
    // confirms that there are selected files before download
    if (selectedFiles.length === 0) {
      alert('Please select at least one file.');
      return;
    }
    try {
      // Create a new JSZip instance
      const zip = new JSZip();
      
      // Add each selected file to the zip archive
      for (const file of selectedFiles) {
        const response = await ApiUtil.getFile(file.key);
        const blob = await response.blob();
        
        // Add the file to the zip archive with the file name as the key
        zip.file(file.key, blob);
      }
  
      // Create a download link for the zip file
      const downloadLink = document.createElement('a');
      
      // Use the JSZip Blob method to create a Blob from the zip archive
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadLink.href = URL.createObjectURL(zipBlob);
      downloadLink.download = 'DataViewerFiles.zip';
  
      // Append the link to the document and trigger the download
      document.body.appendChild(downloadLink);
      downloadLink.click();
  
      // Remove the link from the document
      document.body.removeChild(downloadLink);
  
    } catch (error) {
      console.error('Error downloading files:', error);
    }
  };

  return ReactDom.createPortal(
    
    <div className="container" ref={modalRef} onClick={closeModal}>
      <div className="modal">
        <div className='file-Storage-Container'>
          <div className="download-browser">
            <h1 className="download-title"> Download Files </h1>
            <FileStorage files={files} selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles}/>
          </div>
          <div className="downloadContainer">
            <button className="downloadButton" onClick={() => {
            // OnClick, it will download the selected files
              downloadFiles();
            }}>Download</button>
          </div>
        </div>
        <button className="closeButton" onClick={() => setModal('')}>X</button>
      </div>
    </div>,
    document.getElementById('portal')
  );

};
