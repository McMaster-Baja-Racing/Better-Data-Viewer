import styles from './PresetFilesModal.module.scss';
import { BaseModal } from '@components/ui/baseModal/BaseModal';
import { FileTable } from '@components/ui/fileTable/FileTable';
import { UploadForm } from '@components/ui/uploadForm/UploadForm';
import { Button } from '@components/ui/button/Button';
import { useState } from 'react';
import { rightArrowIcon } from '@assets/icons';
import { ApiUtil } from '@lib/apiUtils';
import { DataViewerPreset, FileInformation } from '@types';
import { showWarningToast } from '@components/ui/toastNotification/ToastNotification';
import { useFiles } from '@lib/files/useFiles';
import { getFolders } from '@lib/files/filesHelpers';

interface PresetFilesModalProps {
  onClose: () => void;
  isOpen: boolean;
  onSubmit: (fileKeys: string[], preset: DataViewerPreset) => void;
  preset: DataViewerPreset;
}

export const PresetFilesModal = ({ onClose, isOpen, onSubmit, preset }: PresetFilesModalProps) => {
  // TODO: Adjust based on preset
  const [selectedFiles, setSelectedFiles] = useState<FileInformation[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const { data: files, refetch } = useFiles();

  const handleSubmit = async () => {
    if (selectedFiles.length === 0 && uploadedFiles.length === 0) {
      showWarningToast('Oops!', 'Please select or upload at least one file');
      return;
    }

    const uploadPromises = uploadedFiles.map((file) => ApiUtil.uploadFile(file));
    await Promise.all(uploadPromises);

    // TODO: Clean up this mess of file types
    const fileKeys = selectedFiles.map((file) => file.key);
    fileKeys.push(...uploadedFiles.map((file) => file.name));

    onSubmit(fileKeys, preset);
    onClose();
    refetch(); // Refetch files after upload
  };

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
              <FileTable 
                files={getFolders(files || [])} 
                selectedFiles={selectedFiles} 
                setSelectedFiles={setSelectedFiles} 
              />
            </div>
          </div>
        </div>

        <Button 
          onClick={handleSubmit}
          textSize={'2rem'}
          className={styles.submitButton}
        >
          <span>Submit</span>
          <img src={rightArrowIcon} alt="right arrow"/>
        </Button>
      </div>
    </BaseModal>
  );
};
