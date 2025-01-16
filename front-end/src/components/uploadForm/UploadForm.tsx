import styles from './UploadForm.module.scss';
import uploadIcon from '@assets/icons/upload.svg';
import deleteIcon from '@assets/icons/close.svg';
import cx from 'classnames';

interface uploadFormProps {
  files: File[];
  setFiles: (files: File[]) => void;
}

export const UploadForm = ({ files, setFiles }: uploadFormProps) => {
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files) {
      setFiles(Array.from(files));
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles([...files, ...Array.from(e.target.files)]);
    }
  }

  const removeFile = (index: number, e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    setFiles(files.filter((_, i) => i !== index));
  }

  return (
    <label 
      className={styles.uploadForm}
      onDragOver={(e) => handleDragOver(e)}
      onDrop={(e) => handleDrop(e)}
    >
      <div className={cx(styles.uploadFormContent, {[styles.disabled]: files.length > 0})}>
        <img className={styles.icon} src={uploadIcon} alt="upload icon" />
        <p className={styles.text}><strong>Choose a file</strong> or drag it here</p>
        <input
        className={styles.input}
        type="file"
        accept=".csv, .bin, .mp4, .mov" 
        multiple={true}
        onChange={(e) => {handleFileChange(e)}}
      />
      </div>
      {files.length > 0 && (
        <ul className={styles.fileList}>
          {files.map((file, index) => (
            <li key={index} className={styles.fileItem}>
              <button onClick={(e) => removeFile(index, e)}>
                <img src={deleteIcon} alt="delete icon" />
              </button>
              <span>{file.name}</span>
            </li>
          ))}
        </ul>
      )}
      
    </label>
  )
}