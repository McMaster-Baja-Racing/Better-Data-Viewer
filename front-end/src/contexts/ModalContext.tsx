/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, useState, ReactNode } from 'react';
import { UploadModal } from '@components/composite/uploadModal/uploadModal';
import { DownloadModal } from '@components/composite/downloadModal/downloadModal';
import { PresetFilesModal } from '@components/composite/presetFilesModal/PresetFilesModal';

type ModalType = 'upload' | 'download' | 'preset' | null;

interface ModalState {
  type: ModalType;
  props: any;
}

interface ModalContextProps {
  openModal: (type: ModalType, props?: any) => void;
  closeModal: () => void;
}

const ModalContext = createContext<ModalContextProps>({
  openModal: () => {},
  closeModal: () => {}
});

// Limit one modal open at a time
export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [modal, setModal] = useState<ModalState>({ type: null, props: {} });

  const openModal = (type: ModalType, props = {}) => {
    setModal({ type, props });
  };

  const closeModal = () => {
    setModal({ type: null, props: {} });
  };

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      {modal.type === 'upload' && (
        <UploadModal isOpen onClose={closeModal} {...modal.props} />
      )}
      {modal.type === 'download' && (
        <DownloadModal isOpen onClose={closeModal} {...modal.props} />
      )}
      {modal.type === 'preset' && (
        <PresetFilesModal isOpen onClose={closeModal} {...modal.props} />
      )}
    </ModalContext.Provider>
  );
};

export const useModal = () => useContext(ModalContext);