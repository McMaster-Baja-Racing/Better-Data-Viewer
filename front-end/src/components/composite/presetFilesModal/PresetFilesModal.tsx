import styles from './PresetFilesModal.module.scss';
import { BaseModal } from '@components/ui/baseModal/BaseModal';
import { FileTable } from '@components/ui/fileTable/FileTable';
import { Button } from '@components/ui/button/Button';
import { useState, useEffect } from 'react';
import { rightArrowIcon } from '@assets/icons';
import { ApiUtil } from '@lib/apiUtils';
import { FileInformation } from '@types';
import { showWarningToast } from '@components/ui/toastNotification/ToastNotification';
import { useFiles } from '@lib/files/useFiles';
import { getFolders } from '@lib/files/filesHelpers';
import { DropdownOption } from '@components/ui/dropdown/Dropdown';

interface PresetFilesModalProps {
  onClose: () => void;
  isOpen: boolean;
  onSubmit: (fileKeys: string[]) => void;
  currentSources?: DropdownOption<string>[];
}

export const PresetFilesModal = ({ onClose, isOpen, onSubmit, currentSources }: PresetFilesModalProps) => {
  // TODO: Adjust based on preset
  const [selectedFiles, setSelectedFiles] = useState<FileInformation[]>([]);
  const { data: files } = useFiles();

  // Pre-select files based on currentSources prop
  useEffect(() => {
    if (!currentSources || !files?.length) return;

    const sourceKeys = new Set(currentSources.map(s => s.value));

    setSelectedFiles(
      getFolders(files).filter(file => sourceKeys.has(file.key))
    );
  }, [currentSources, files]);

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      showWarningToast('Oops!', 'Please select at least one file');
      return;
    }

    const fileKeys = selectedFiles.map((file) => file.key);
    onSubmit(fileKeys);
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <div className={styles.presetFilesModal}>
        <h2 className={styles.title}>Select a file</h2>
        <div className={styles.tableWrapper}>
          <FileTable 
            files={getFolders(files || [])} 
            selectedFiles={selectedFiles} 
            setSelectedFiles={setSelectedFiles} 
          />
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
