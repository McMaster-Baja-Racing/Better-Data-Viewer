//Modal.js
import { useRef } from "react";
import ReactDom from "react-dom";
import '../styles/modalStyles.css';
import { useForm } from "react-hook-form";
export const UploadModal = ({ setShowUploadModal }) => {
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

    fetch(`http://${window.location.hostname}:8080/upload`, {
      method: "POST",
      body: formData,
    }).then((res) => {
      res.text().then(text => {
        alert(JSON.stringify(`${text}, status: ${res.status}`))
      })
    }).catch(e => {
      alert(e)
    })
    //setShowUploadModal(false); Dont need to do this neccesarily
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