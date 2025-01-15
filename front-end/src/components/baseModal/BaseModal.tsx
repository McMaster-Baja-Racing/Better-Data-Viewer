import ReactModal from 'react-modal';
import styles from './BaseModal.module.scss';
import closeIcon from '@assets/icons/close.svg';

ReactModal.setAppElement('#root'); // To improve accessibility

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const BaseModal = ({isOpen, onClose, children}: BaseModalProps) => (
  <ReactModal
    isOpen={isOpen}
    onRequestClose={onClose}
    className={styles.modalContent}
    overlayClassName={styles.modalOverlay}
  >
    <button className={styles.closeButton} onClick={onClose}>
      <img src={closeIcon} alt="Close" className={styles.icon} />
    </button>
    {children}
  </ReactModal>
);
