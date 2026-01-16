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


export const UploadForm = ({ files, setFiles, allowFolder = false,
  accept = '.csv, .bin, .mp4, .mov, .fit' }:UploadFormProps) => {
  
  const [isDragging, setIsDragging] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const folderInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if(e.dataTransfer.items) {

	  const newFiles: File[] = [];

      const traverseFileTree = (item: FileSystemEntry, path = ''): Promise<void> => {
        return new Promise((resolve) => {
          if (item.isFile) {
            (item as FileSystemFileEntry).file((file: File) => {
              const f = new File([file], file.name, { type: file.type });
              newFiles.push(f);
              resolve();
            });
          } else if (item.isDirectory) {
            const dirReader = (item as FileSystemDirectoryEntry).createReader();
            dirReader.readEntries((entries: FileSystemEntry[]) => {
              Promise.all(entries.map((entry) => traverseFileTree(entry, path+item.name + '/'))).then(() => resolve());
            });
          } else {
            resolve();
          }
        });
      };

      const promises: Promise<void>[] = [];
	  for (const item of Array.from(e.dataTransfer.items)) {
        const entry = item.webkitGetAsEntry();
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

  const handleFolderClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    e.stopPropagation();
    folderInputRef.current?.click();
  };

  const handleContentClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div 
      className={cx(styles.uploadForm, {[styles.dragover]: isDragging})}
      onDragOver={(e) => handleDragOver(e)}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => handleDrop(e)}
    >
      <div className={styles.daytimeBg}/>
      <div className={styles.nighttimeBg}/>
      <img className={styles.nighttimeImage} src={nighttime} alt='nighttime'/>
      <img className={styles.daytimeImage} src={daytime} alt='daytime'/>

      <div 
        className={cx(styles.uploadFormContent, {
          [styles.disabled]: files.length > 0,
          [styles.dragover]: isDragging
        })}
      >
        <div onClick={handleContentClick} className={styles.clickableArea}>
          <img className={styles.icon} src={uploadIcon} alt='upload icon' />
          <p className={styles.text}><strong>Choose a file</strong> or drag it here</p>
        </div>
        {allowFolder && (
          <button type="button" className={styles.folderLink} onClick={handleFolderClick}>
            or click here for a folder
          </button>
        )}
        <p className={styles.textHover}><strong>Drop the file</strong></p>
        <input
          ref={fileInputRef}
          className={styles.input}
          type='file'
          accept={accept}
          multiple={true}
          onChange={(e) => {handleFileChange(e);}}
        />
        {allowFolder && (
          <input
            ref={folderInputRef}
            className={styles.input}
            type='file'
            multiple={true}
            onChange={(e) => {handleFileChange(e);}}
            /* @ts-expect-error – webkitdirectory is a non-standard attribute but required for folder upload  */
            webkitdirectory=''
          />
        )}
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
      
    </div>
  );
};
