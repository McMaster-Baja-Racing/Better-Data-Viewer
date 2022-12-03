//Modal.js

import { useRef } from "react";
import ReactDom from "react-dom";
import '../styles/styles.css';
import Dropdown from "./Dropdown";
import { useState, useEffect } from 'react';

export const Modal = ({ setShowModal }) => {

  // close the modal when clicking outside the modal.
  const modalRef = useRef();

  const changeHandler = (event) => { console.log(event.target.value); };
  const options = [
    {value: '1', label: 'one'}, 
    {value: '2', label: 'two'}, 
    {value: '3', label: 'three'}
  ];
  const closeModal = (e) => {
    if (e.target === modalRef.current) {
      setShowModal(false);
    }
  };
  //render the modal JSX in the portal div.
  return ReactDom.createPortal(
    <div className="container" ref={modalRef} onClick={closeModal}>
      <div className="modal">
        <div classname="small">
        <input
            type="file"
            name="file"
            accept=".csv"
            onChange={changeHandler}
            style={{ display: "block", margin: "10px auto" }}
          />
          <Dropdown
        placeHolder="Select # Dimensions"
        options={options}
        onChange={(value) => console.log(value)}
      />
        </div>
        <button onClick={() => setShowModal(false)}>X</button>
      </div>
    </div>,
    document.getElementById("portal")
  );
};