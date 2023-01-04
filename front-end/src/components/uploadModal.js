//Modal.js
import { useRef } from "react";
import ReactDom from "react-dom";
import '../styles/modalStyles.css';
import { useForm } from "react-hook-form";
export const UploadModal = ({setShowUploadModal}) => {
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
    const formData = new FormData();
    formData.append("file", data.file[0]);

    const res = await fetch("http://localhost:8080", {
      mode: 'no-cors',
      method: "POST",
      body: formData,
    }).then((res) => res.json());
    alert(JSON.stringify(`${res.message}, status: ${res.status}`));
    setShowUploadModal(false);
  };

  return ReactDom.createPortal(
    <div className="container" ref={modalRef} onClick={closeModal}>
      <div className="modal">
        <div className="small">
            <h1>Upload Files</h1>
            <form onSubmit={handleSubmit(onSubmit)}>
            <input type="file" {...register("file")} />

            <input type="submit" />
          </form>
        </div>
        <button className="closeButton" onClick={() => setShowUploadModal(false)}>X</button>
      </div>
    </div>,
    document.getElementById("portal")
  );
};