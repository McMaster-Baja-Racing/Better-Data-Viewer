//Modal.js
import { useRef } from "react";
import ReactDom from "react-dom";
import '../styles/modalStyles.css';
import '../styles/dragNdrop.css';
import { useForm } from "react-hook-form";
import React, { useState } from 'react';
export const UploadModal = ({ setShowUploadModal }) => {
  
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
  // triggers when file is dropped
  const handleDrop = function (e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      // at least one file has been selected so do something
      // handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = function (e) {
    console.log(e)
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      // at least one file has been selected so do something
      // handleFiles(e.target.files);
      onSubmit(e.target.files);
      console.log(e)
    }
  };

  // close the modal when clicking outside the modal.
  const modalRef = useRef();

  const closeModal = (e) => {
    if (e.target === modalRef.current) {
      setShowUploadModal(false);
    }
  };

  const { register, handleSubmit } = useForm();
  //This stuff is for backend API
  const onSubmit = async (data) => {
    //upload multiple files
    const formData = new FormData();
    //start loading useState
    if (data.file.length!=0){
    setLoading(true);
    console.log(loading);
    await new Promise((resolve, reject) => {
      for (let i = 0; i < data.file.length; i++) {
        formData.set("file", data.file[i]);
        fetch(`http://${window.location.hostname}:8080/upload`, {
          method: "POST",
          body: formData,
        }).then((res) => {
          res.text().then(text => {
            if(res.status !== 200) {
              alert(JSON.stringify(`${text}, status: ${res.status}`))
            }
            if (i===data.file.length-1) {
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
    console.log(loading);
    setLoading(false);
  }
    //setShowUploadModal(false); Dont need to do this neccesarily
  };
  return ReactDom.createPortal(
    <div className="container" ref={modalRef} onClick={closeModal}>
      <div className="modal">
        <div className="centerFlexBox">
          <h1>Upload Files</h1>
          <form id="form-file-upload" onDragEnter={handleDrag} onSubmit={handleSubmit(onSubmit)}>
            <input type="file" accept=".csv, .bin" id="input-file-upload" multiple={true} onChange={handleChange} {...register("file")} />
            <label id="label-file-upload" htmlFor="input-file-upload" className={dragActive ? "drag-active" : ""}>
              <div>
                <p>Drag and drop your file here or click to browse your files</p>
              </div>
            </label>
            {dragActive && <div id="drag-file-element" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}></div>}
            <button onClick={(() => {
            console.log("babeyy")
            fetch(`http://${window.location.hostname}:8080/deleteAll`).then((res) => {
              alert(res)
            }).catch((err) => {
              console.log(err)
            })
          })}>Delete All</button>
          {loading && <img className="loading" src={process.env.PUBLIC_URL + 'eeee.gif'} alt="Loading..."/>}
          <input className="submitbutton" type="submit" />
          </form>
        </div>
        <button className="closeButton" onClick={() => setShowUploadModal(false)}>X</button>
      </div>
    </div>,
    document.getElementById("portal")
  );

};
