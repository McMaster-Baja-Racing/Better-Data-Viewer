import styles from './presetFilesModal.module.scss';
import { BaseModal } from '@components/baseModal/BaseModal';
import { FileTable } from '@components/fileTable/FileTable';
import { UploadForm } from '@components/uploadForm/UploadForm';
import { Button } from '@components/button/Button';
import { useState, useEffect } from 'react';
import rightArrow from '@assets/icons/arrow.svg';
import { ApiUtil } from '@lib/apiUtils';
import { File as CustomFile, FileInformation } from '@types';

interface PresetFilesModalProps {
  onClose: () => void;
  isOpen: boolean;
  setBins: (fileKeys: string[]) => void;
}

export const PresetFilesModal = ({ onClose, isOpen, setBins }: PresetFilesModalProps) => {
  const [existingFiles, setExistingFiles] = useState<CustomFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<CustomFile[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  useEffect(() => {
    const fetchFiles = async () => {
      const files = await ApiUtil.getFolder('csv');
      setExistingFiles(apiToFiles(files));
    }

    fetchFiles();
  }, []);

  const handleSubmit = async () => {
    if (selectedFiles.length === 0 && uploadedFiles.length === 0) {
      // TODO: Replace with alert popup
      alert('Please select or upload at least one file');
      return;
    }

    const uploadPromises = uploadedFiles.map((file) => ApiUtil.uploadFile(file));
    await Promise.all(uploadPromises);

    // TODO: Clean up this mess of file types
    const fileKeys = selectedFiles.map((file) => file.key);
    fileKeys.push(...uploadedFiles.map((file) => file.name));

    setBins(fileKeys);
    onClose();
  }

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <div className={styles.presetFilesModal}>

        <div className={styles.formWrapper}>
          <div className={styles.uploadForm}>
            <h2 className={styles.title}>Upload your files</h2>
            <UploadForm files={uploadedFiles} setFiles={setUploadedFiles} accept={'.bin'}/>
          </div>

          <div className={styles.selectFiles}>
            <h2 className={styles.title}>...Or select existing ones</h2>
            <div className={styles.tableWrapper}>
              <FileTable files={existingFiles} selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles} />
            </div>
          </div>
        </div>

        <Button 
          onClick={handleSubmit}
          textSize={'2rem'}
          className={styles.submitButton}
        >
          <span>Submit</span>
          <img src={rightArrow} alt="right arrow"/>
        </Button>
      </div>
    </BaseModal>
  );
}

// Converts from fileInformation, which only has key, fileHeaders and size
// to the File type, which has key, name, size, date, extension.
// For now, make up the date, and for the extension, just take the last part of the key after the last period.
// Further, the name doesn't have any folders preceeding it, so split along / and take the last part.
const apiToFiles = (apiFiles: FileInformation[]): CustomFile[] => {
  return apiFiles.map((file) => {
    const keyParts = file.key.split('/');
    const name = keyParts[keyParts.length - 1];
    const extension = name.split('.')[name.split('.').length - 1];
    return {
      key: file.key,
      name,
      size: file.size,
      date: '2021-01-01', // TODO: Make this dynamic
      extension
    };
  });
}