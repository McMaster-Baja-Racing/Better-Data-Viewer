import { ToastContainer, toast, Flip } from 'react-toastify';
import styles from './ToastNotification.module.scss';

export const ToastNotification = () => {
  return (
    <ToastContainer
      position='bottom-right'
      theme="dark"
      newestOnTop
      transition={Flip}
      pauseOnHover={true}
      autoClose={5000}
      toastClassName={styles.toast}
    />
  );
};

export function showErrorToast(description?: string) {
  toast.error(
    <div className={styles.errorContainer}>
      <h2 className={styles.title}>{'Oops, an error occured!'}</h2>
      {description && 
        <p className={styles.description}>{description}</p>
      }
    </div>,
  );
}

export function showSuccessToast(title: string, description?: string) {
  toast.success(
    <div className={styles.successContainer}>
      <h2 className={styles.title}>{title}</h2>
      {description && 
        <p className={styles.description}>{description}</p>
      }
    </div>,
  );
}

export function showWarningToast(title: string, description?: string) {
  toast.warn(
    <div className={styles.warningContainer}>
      <h2 className={styles.title}>{title}</h2>
      {description && 
        <p className={styles.description}>{description}</p>
      }
    </div>,
  );
}

export function showInfoToast(title: string, description?: string) {
  toast.info(
    <div className={styles.infoContainer}>
      <h2 className={styles.title}>{title}</h2>
      {description && 
        <p className={styles.description}>{description}</p>
      }
    </div>,
  );
}