import styles from './uploadModal.module.scss';
import { BaseModal } from '@components/baseModal/BaseModal';
import { UploadForm } from '@components/uploadForm/UploadForm';
import { Button } from '@components/button/Button';
import { useState } from 'react';
import rightArrow from '@assets/icons/arrow.svg';
import { ApiUtil } from '@lib/apiUtils';

interface UploadModalProps {
  setIsOpen: (modal: boolean) => void;
  isOpen: boolean;
}

export const UploadModal = ({ setIsOpen, isOpen }: UploadModalProps) => {
  const [files, setFiles] = useState<File[]>([]);

  const submitFiles = async () => {
    files.forEach(async (file) => {
      ApiUtil.uploadFile(file);
    });
    setIsOpen(false);
  }

  return (
    <BaseModal isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <div className={styles.uploadModal}>
        <h2 className={styles.title}>Upload your file</h2>
        <UploadForm files={files} setFiles={setFiles} />
        <Button 
          onClick={submitFiles} 
          textSize={'2rem'}
          className={styles.submitButton}
        >
          Submit
          <img src={rightArrow}/>
        </Button>
      </div>
    </BaseModal>
  );
}