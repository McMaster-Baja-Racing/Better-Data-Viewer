//Modal.js

import { useRef } from "react";
import ReactDom from "react-dom";
import { Dropdown } from './Dropdown.js'
import { Element } from './Element.js';
import '../styles/styles.css';
import { useState, useEffect } from 'react';

export const Modal = ({ setShowModal }) => {

  // close the modal when clicking outside the modal.
  const modalRef = useRef();

  const changeHandler = (event) => { console.log(event.target.value); };

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

          <Dropdown>
            <Element />
          </Dropdown>

        </div>
        <div classname="small">
          <input
            type="file"
            name="file"
            accept=".csv"
            onChange={changeHandler}
            style={{ display: "block", margin: "10px auto" }}
          />
        </div>
        <button onClick={() => setShowModal(false)}>X</button>
      </div>
    </div>,
    document.getElementById("portal")
  );
};