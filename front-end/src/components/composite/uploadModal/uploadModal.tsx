import styles from './uploadModal.module.scss';
import { BaseModal } from '@components/ui/baseModal/BaseModal';
import { UploadForm } from '@components/ui/uploadForm/UploadForm';
import { Button } from '@components/ui/button/Button';
import { useState } from 'react';
import {rightArrowIcon, folderIcon, cubeIcon} from '@assets/icons';
import { ApiUtil } from '@lib/apiUtils';
import { showSuccessToast } from '@components/ui/toastNotification/ToastNotification';
import { useFiles } from '@lib/files/useFiles';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UploadModal = ({ isOpen, onClose }: UploadModalProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const { refetch } = useFiles();
  const [allowFolder, setAllowFolder] = useState(false);

  const submitFiles = async () => {
    const uploadPromises = files.map((file) => ApiUtil.uploadFile(file));
    await Promise.all(uploadPromises);
    showSuccessToast('Files uploaded successfully', files.map(file => file.name).join('\n'));
    onClose();
    refetch(); // Refetch files after upload
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <div className={styles.uploadModal}>
        <h2 className={styles.title}>Upload your files</h2>

        <UploadForm files={files} setFiles={setFiles} allowFolder={allowFolder} />
        
        <div className={styles.buttonRow}>

          <Button 
            onClick={() => setAllowFolder(prev => !prev)} 
            textSize={'2rem'}
            className={styles.submitButton}
          >
            <span>{allowFolder ? 'Folder Upload' : 'File Upload'}</span>
            <img src={allowFolder ? folderIcon : cubeIcon} alt='right arrow'/>
          </Button>

		  <Button 
            onClick={submitFiles} 
            textSize={'2rem'}
            className={styles.submitButton}
          >
            <span>Submit</span>
            <img src={rightArrowIcon} alt="right arrow"/>
          </Button>
  
        </div>

      </div>
    </BaseModal>
  );
};