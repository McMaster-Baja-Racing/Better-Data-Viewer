//Modal.js
import { useRef } from "react";
import ReactDom from "react-dom";
import '../styles/modalStyles.css';
import { useState, useEffect } from 'react';
import Papa from "papaparse";
export const uploadModal = setShowModal => {
    // close the modal when clicking outside the modal.
  const modalRef = useRef();
  
  const closeModal = (e) => {
    if (e.target === modalRef.current) {
      setShowModal(false);
    }
  };

  return ReactDom.createPortal(
    <div className="container" ref={modalRef} onClick={closeModal}>
      <div className="modal">
        <div className="small">
          <button onClick={listFiles}>Fetch uploaded files!</button>
          <p>{files}</p>

          <button onClick={getHeaders}>Fetch headers!</button>
          {columns.map((column, index) => {
            return (
              <div key={index}>
                {column.header} - {column.filename}
              </div>
            )
          })}
          
          <label htmlFor="Dimensions">Choose a Dimension:</label>
          <select className="dimensions" onChange={handleSelect}>
            <option value="1">1</option>
            <option value="2" selected="selected">2</option>
            <option value="3">3</option>
          </select>
          <div>
            {dimensional(dimensions)}
          </div>
          
          
        </div>
        <button onClick={handleSubmit}>Submit!</button>
        <button className="closeButton" onClick={() => setShowModal(false)}>X</button>
      </div>
    </div>,
    document.getElementById("portal")
  );
};