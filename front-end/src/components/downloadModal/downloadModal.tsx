import styles from './downloadModal.module.scss';
import { BaseModal } from '@components/baseModal/BaseModal';
import { FileTable } from '@components/fileTable/FileTable';
import { Button } from '@components/button/Button';
import { useState, useEffect } from 'react';
import rightArrow from '@assets/icons/arrow.svg';
import { ApiUtil } from '@lib/apiUtils';
import { File, FileInformation } from '@types';
import JSZip from 'jszip';

interface DownloadModalProps {
  setIsOpen: (modal: boolean) => void;
  isOpen: boolean;
}

export const DownloadModal = ({ setIsOpen, isOpen }: DownloadModalProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const downloadFiles = async () => {
    try {
      const zip = new JSZip();
      
      for (const file of selectedFiles) {
        const blob = await ApiUtil.getFileAsText(file.key);
        zip.file(file.key, blob);
      }
  
      // Here we generate the zip, then create a link and click it to download the zip
      const downloadLink = document.createElement('a');
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      downloadLink.href = URL.createObjectURL(zipBlob);
      downloadLink.download = 'DataViewerFiles.zip';
  
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
  
    } catch (error) {
      console.error('Error downloading files:', error); // TODO: Handle error properly
    }
  }

  useEffect(() => {
    const fetchFiles = async () => {
      const files = await ApiUtil.getFolder('csv');
      setFiles(apiToFiles(files));
    }

    fetchFiles();
  }, []);

  return (
    <BaseModal isOpen={isOpen} onClose={() => setIsOpen(false)}>
      <div className={styles.downloadModal}>
        <h2 className={styles.title}>Upload your file</h2>
        <div className={styles.tableWrapper}>
          <FileTable files={files} selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles} />
        </div>
        <Button 
          onClick={downloadFiles}
          textSize={'2rem'}
          className={styles.submitButton}
        >
          Download
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
const apiToFiles = (apiFiles: FileInformation[]): File[] => {
  return apiFiles.map((file) => {
    const keyParts = file.key.split('/');
    const name = keyParts[keyParts.length - 1];
    const extension = name.split('.')[name.split('.').length - 1];
    return {
      key: file.key,
      name,
      size: file.size,
      date: '2021-01-01',
      extension
    };
  });
}