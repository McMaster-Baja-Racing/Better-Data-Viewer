import styles from './UploadForm.module.scss';
import uploadIcon from '@assets/icons/upload.svg';

interface uploadFormProps {
  files: File[];
  setFiles: (files: File[]) => void;
}

export const UploadForm = ({ files, setFiles }: uploadFormProps) => {


  return (
    <div className={styles.uploadForm}>
      <div className={styles.uploadFormContent}>
        <img className={styles.icon} src={uploadIcon} alt="upload icon" />
        <p className={styles.text}><strong>Choose a file</strong> or drag it here</p>
      {/* <input
        type="file"
        accept=".csv, .bin, .mp4, .mov" 
        multiple={true}
        onChange={(e) => {
          const files = e.target.files;
          if (files) {
            setFiles(Array.from(files));
          }
        }}
      /> */}
      </div>
    </div>
  )
}