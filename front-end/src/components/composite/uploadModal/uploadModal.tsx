import { useEffect, useState } from 'react';
import { BaseModal } from '@components/ui/baseModal/BaseModal';
import { Button } from '@components/ui/button/Button';
import { LoadingOverlay } from '@components/ui/loadingOverlay/LoadingOverlay';
import { UploadForm } from '@components/ui/uploadForm/UploadForm';
import { useLoading } from '@contexts/LoadingContext';
import { ApiUtil } from '@lib/apiUtils';
import { useFiles } from '@lib/files/useFiles';
import { showErrorToast, showSuccessToast } from '@components/ui/toastNotification/ToastNotification';
import { rightArrowIcon } from '@assets/icons';
import styles from './uploadModal.module.scss';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UploadModal = ({ isOpen, onClose }: UploadModalProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const { refetch } = useFiles();
  const { isLoading, loadingMessage, setLoading } = useLoading();

  useEffect(() => {
    if (isOpen) {
      setLoading(false);
    }
  }, []);

  const submitFiles = async () => {
    if (files.length === 0) return;
    
    setLoading(true, `Uploading ${files.length} file${files.length !== 1 ? 's' : ''}...`);
    
    type UploadResult = 
      | { success: true; fileName: string }
      | { success: false; fileName: string; error: string };
    
    try {
      const uploadPromises = files.map((file): Promise<UploadResult> => 
        ApiUtil.uploadFile(file)
          .then(() => ({ success: true as const, fileName: file.name }))
          .catch((error) => ({ success: false as const, fileName: file.name, error: error.message }))
      );
      const results = await Promise.all(uploadPromises);
      
      const successful = results.filter((r): r is Extract<UploadResult, { success: true }> => r.success);
      const failed = results.filter((r): r is Extract<UploadResult, { success: false }> => !r.success);
      
      if (successful.length > 0) {
        showSuccessToast(
          `${successful.length} file${successful.length !== 1 ? 's' : ''} uploaded successfully`,
          successful.map(r => r.fileName).join('\n')
        );
      }
      
      if (failed.length > 0) {
        showErrorToast(
          failed.map(r => `${r.fileName}: ${r.error}`).join('\n')
        );
      }
      
      if (successful.length > 0) {
        setFiles(files.filter(f => failed.some(failed => failed.fileName === f.name)));
        if (failed.length === 0) {
          onClose();
        }
        refetch();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose}>
      <LoadingOverlay isVisible={isLoading} message={loadingMessage} />
      <div className={styles.uploadModal}>
        <h2 className={styles.title}>Upload your file</h2>
        <UploadForm files={files} setFiles={setFiles} />
        <Button 
          onClick={submitFiles} 
          textSize={'2rem'}
          className={styles.submitButton}
          disabled={files.length === 0}
        >
          <span>Submit</span>
          <img src={rightArrowIcon} alt="right arrow"/>
        </Button>
      </div>
    </BaseModal>
  );
};