import styles from './downloadModal.module.scss';
import { BaseModal } from '@components/ui/baseModal/BaseModal';
import { FileTable } from '@components/ui/fileTable/FileTable';
import { Button } from '@components/ui/button/Button';
import { useState } from 'react';
import { rightArrowIcon } from '@assets/icons';
import { ApiUtil } from '@lib/apiUtils';
import { FileInformation } from '@types';
import JSZip from 'jszip';
import { showErrorToast } from '@components/ui/toastNotification/ToastNotification';
import { useFiles } from '@lib/files/useFiles';

interface DownloadModalProps {
  onClose: () => void;
  isOpen: boolean;
}

export const DownloadModal = ({ onClose, isOpen }: DownloadModalProps) => {
  const [selectedFiles, setSelectedFiles] = useState<FileInformation[]>([]);
  const { data: files } = useFiles();

  const downloadFiles = async () => {
    try {
      const zip = new JSZip();
      
      for (const file of selectedFiles) {
        const fileContent = await ApiUtil.getFileAsText(file.key);
        zip.file(file.key, fileContent);
      }
  
      // Here we generate the zip, then create a link and click it to download the zip
      const downloadLink = document.createElement('a');
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadLink.href = URL.createObjectURL(zipBlob);
      downloadLink.download = 'DataViewerFiles.zip';
  
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      showErrorToast(`Error downloading files: ${errorMessage}`);
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <div className={styles.downloadModal}>
        <h2 className={styles.title}>Download Data</h2>
        <div className={styles.tableWrapper}>
          <FileTable files={files} selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles} />
        </div>
        <Button 
          onClick={downloadFiles}
          textSize={'2rem'}
          className={styles.submitButton}
        >
          Download
          <img src={rightArrowIcon} alt="right arrow"/>
        </Button>
      </div>
    </BaseModal>
  );
};