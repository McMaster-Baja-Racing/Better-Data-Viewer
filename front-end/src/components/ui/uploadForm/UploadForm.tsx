import React from 'react';
import styles from './UploadForm.module.scss';
import {uploadIcon, closeIcon} from '@assets/icons';
import cx from 'classnames';
import daytime from '@assets/upload_form_daytime.png';
import nighttime from '@assets/upload_form_nighttime.png';

interface UploadFormProps {
  files: File[];
  setFiles: (files: File[]) => void;
  accept?: string;
 allowFolder: boolean;
}


export const UploadForm = ({ files, setFiles, allowFolder = false, accept = '.csv, .bin, .mp4, .mov, .fit' }: UploadFormProps) => {
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
	if(e.dataTransfer.items) {

	  const newFiles: File[] = [];

      const traverseFileTree = (item: any, path = ""): Promise<void> => {
        return new Promise((resolve) => {
          if (item.isFile) {
            item.file((file: File) => {
              const f = new File([file], file.name, { type: file.type });
              newFiles.push(f);
              resolve();
            });
          } else if (item.isDirectory) {
            const dirReader = item.createReader();
            dirReader.readEntries((entries: any[]) => {
              Promise.all(entries.map((entry) => traverseFileTree(entry, path + item.name + "/"))).then(() => resolve());
            });
          } else {
            resolve();
          }
        });
      };

      const promises: Promise<void>[] = [];
      for (let i = 0; i < e.dataTransfer.items.length; i++) {
        const entry = e.dataTransfer.items[i].webkitGetAsEntry();
        if (entry) promises.push(traverseFileTree(entry));
      }
  
      Promise.all(promises).then(() => {
        setFiles([...files, ...newFiles]);
      });
	} else if (e.dataTransfer.files) {
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
        <p className={styles.text}><strong>Choose a {allowFolder ? "folder" : "file"}</strong> or drag it here</p>
        <p className={styles.textHover}><strong>Drop the file</strong></p>
        <input
          className={styles.input}
          type="file"
          accept={accept}
          multiple={true}
          onChange={(e) => {handleFileChange(e);}}
		  /* @ts-expect-error */
		  webkitdirectory={allowFolder ? "" : undefined}
        />
      </div>
      {files.length > 0 && (
        <ul className={styles.fileList}>
          {files.map((file, index) => (
            <li key={index} className={styles.fileItem}>
              <button onClick={(e) => handleRemoveFile(index, e)}>
                <img src={closeIcon} alt="delete icon" />
              </button>
              <span>{file.name}</span>
            </li>
          ))}
        </ul>
      )}
      
    </label>
  );
};
