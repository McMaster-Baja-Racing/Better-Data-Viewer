import styles from './UploadForm.module.scss';
import uploadIcon from '@assets/icons/upload.svg';

interface uploadFormProps {
  files: File[];
  setFiles: (files: File[]) => void;
}

export const UploadForm = ({ files, setFiles }: uploadFormProps) => {


  return (
    <div className={styles.uploadForm}>
      <label className={styles.uploadFormContent}>
        <img className={styles.icon} src={uploadIcon} alt="upload icon" />
        <p className={styles.text}><strong>Choose a file</strong> or drag it here</p>
        <input
        className={styles.input}
        type="file"
        accept=".csv, .bin, .mp4, .mov" 
        multiple={true}
        onChange={(e) => {
          const files = e.target.files;
          if (files) {
            setFiles(Array.from(files));
          }
        }}
      />
      </label>

      
    </div>
  )
}