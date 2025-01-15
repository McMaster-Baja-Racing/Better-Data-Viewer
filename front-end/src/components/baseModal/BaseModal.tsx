import React, { useState } from 'react';
import ReactModal from 'react-modal';
import styles from './BaseModal.module.scss';
import closeIcon from '@assets/icons/close.svg';

ReactModal.setAppElement('#root'); // To improve accessibility

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const BaseModal = ({ isOpen, onClose, children }: BaseModalProps) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, 300);
  };

  return (
    <ReactModal
      isOpen={isOpen}
      onRequestClose={handleClose}
      className={`${styles.modalContent} ${isClosing ? styles.close : ''}`}
      overlayClassName={`${styles.modalOverlay} ${isClosing ? styles.close : ''}`}
    >
      <button className={styles.closeButton} onClick={handleClose}>
        <img src={closeIcon} alt="Close" className={styles.icon} />
      </button>
      {children}
    </ReactModal>
  );
};
