import React from 'react';
import styles from './UploadForm.module.scss';
import uploadIcon from '@assets/icons/upload.svg';
import deleteIcon from '@assets/icons/close.svg';
import cx from 'classnames';
import daytime from '@assets/upload_form_daytime.png';
import nighttime from '@assets/upload_form_nighttime.png';

interface UploadFormProps {
  files: File[];
  setFiles: (files: File[]) => void;
  accept?: string;
}

export const UploadForm = ({ files, setFiles, accept = '.csv, .bin, .mp4, .mov, .fit' }: UploadFormProps) => {
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setFiles([...files, ...Array.from(e.dataTransfer.files)]);
    }
    setIsDragging(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  };

  const handleRemoveFile = (index: number, e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <label 
      className={cx(styles.uploadForm, {[styles.dragover]: isDragging})}
      onDragOver={(e) => handleDragOver(e)}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => handleDrop(e)}
    >
      <div className={styles.daytimeBg}/>
      <div className={styles.nighttimeBg}/>
      <img className={styles.nighttimeImage} src={nighttime} alt="nighttime"/>
      <img className={styles.daytimeImage} src={daytime} alt="daytime"/>

      <div className={cx(styles.uploadFormContent, {
        [styles.disabled]: files.length > 0,
        [styles.dragover]: isDragging
      })}>
        <img className={styles.icon} src={uploadIcon} alt="upload icon" />
        <p className={styles.text}><strong>Choose a file</strong> or drag it here</p>
        <p className={styles.textHover}><strong>Drop the file</strong></p>
        <input
          className={styles.input}
          type="file"
          accept={accept}
          multiple={true}
          onChange={(e) => {handleFileChange(e);}}
        />
      </div>
      {files.length > 0 && (
        <ul className={styles.fileList}>
          {files.map((file, index) => (
            <li key={index} className={styles.fileItem}>
              <button onClick={(e) => handleRemoveFile(index, e)}>
                <img src={deleteIcon} alt="delete icon" />
              </button>
              <span>{file.name}</span>
            </li>
          ))}
        </ul>
      )}
      
    </label>
  );
};