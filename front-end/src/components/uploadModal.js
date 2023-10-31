//UploadModal.js
import ReactDom from "react-dom";
import '../styles/modalStyles.css';
import '../styles/uploadModalStyles.css';
import { useForm } from "react-hook-form";
import { useRef } from "react";
import React, { useState } from 'react';
export const UploadModal = ({ setShowUploadModal, success, setSuccessMessage}) => {

  const [dragActive, setDragActive] = React.useState(false);
  const [loading, setLoading] = useState(false);
  // handle drag events
  const handleDrag = function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  const [fileLists,setfileLists] = useState([]);

  // triggers when file is dropped
  const handleDrop = function (e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setfileLists([...e.dataTransfer.files, ...fileLists])
  };

  const modalRef = useRef();
  const closeModal = (e) => {
    if (e.target === modalRef.current) {
      setShowUploadModal(false);
    }
  };

  const { register, handleSubmit } = useForm();
  //This stuff is for backend API
  const onSubmit = async () => {
    //upload multiple files
    const formData = new FormData();
    // THIS SHOULD BE A POPUP THAT DECAYS AWAY, NOT AN ALERT
    if (fileLists.length === 0) { 
      alert("Please select a file")
      return
    }
    //start loading useState
    setLoading(true);
    //console.log(loading);
    await new Promise((resolve, reject) => {
      for (let i = 0; i < fileLists.length; i++) {
        formData.set("file", fileLists[i]);
        fetch(`http://${window.location.hostname}:8080/upload`, {
          method: "POST",
          body: formData,
        }).then((res) => {
          res.text().then(text => {
            if(res.status !== 200) {
              alert(JSON.stringify(`${text}, status: ${res.status}`))
            }
            if (i===fileLists.length-1) {
              resolve();
            }
          })
        }).catch(e => { 
          alert(e)
          resolve();
        })
        
      }
    });
    //stop loading useState
    //console.log(loading);
    setLoading(false);

    setShowUploadModal(false); //Dont need to do this neccesarily
    setSuccessMessage("Files Uploaded ");// + fileLists.map((file) => file.name).join(", ")
    success();
  };

  return ReactDom.createPortal(
    
    <div className="container" ref={modalRef} onClick={closeModal}>
      <div className="modal">
        <div className="uploadContainer">
          <h1>Upload Files</h1>
            <form id="form-file-upload" onDragEnter={handleDrag} onSubmit={handleSubmit(onSubmit)}>
            <input type="file" accept=".csv, .bin" id="input-file-upload" multiple={true} {...register("file")} onChange={(e) => {
              setfileLists([...e.target.files, ...fileLists])
            }}/>
            <label id="label-file-upload" htmlFor="input-file-upload" className={dragActive ? "drag-active" : ""}>
              <div>
                {fileLists.length == 0 ? <p>Drag and drop your file here or click to browse your files</p> : fileLists.map((file, index) => {
                  return (
                  <div>
                    <button type="button" onClick={() => {
                      setfileLists(fileLists.filter((f) => f.name !== file.name))
                    }}>X</button>
                    {file.name}
                  </div>)
                })}
              </div>
            </label>
            {dragActive && <div id="drag-file-element" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}></div>}
            <button id = "delete" type="button" onClick={(() => {
            fetch(`http://${window.location.hostname}:8080/deleteAll`).then((res) => {
              alert(res)
            }).catch((err) => {
              console.log(err)
            })
          })}>Delete All</button>
          {loading && <img className="loading" src={process.env.PUBLIC_URL + 'eeee.gif'} alt="Loading..."/>}
          <input id = "submitButton" className="uploadSubmit" type="submit" />
          </form>
        </div>
        <button className="closeButton" onClick={() => setShowUploadModal(false)}>X</button>
      </div>
    </div>,
    document.getElementById("portal")
  );

};
