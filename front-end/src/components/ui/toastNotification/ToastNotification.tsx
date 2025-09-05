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
  // Split the description to separate main error info from technical details
  let mainMessage = description || '';
  let technicalDetails = '';
  
  if (description) {
    const lines = description.split('\n');
    const mainLines: string[] = [];
    const techLines: string[] = [];
    
    for (const line of lines) {
      if (line.startsWith('Error ID:') || line.startsWith('Path:') || line.startsWith('Time:') || 
          line.startsWith('Type:') || line.startsWith('Code:')) {
        techLines.push(line);
      } else {
        mainLines.push(line);
      }
    }
    
    mainMessage = mainLines.join('\n');
    technicalDetails = techLines.join('\n');
  }

  toast.error(
    <div className={styles.errorContainer}>
      <h2 className={styles.title}>{'Oops, an error occurred!'}</h2>
      {mainMessage && 
        <p className={styles.description}>{mainMessage}</p>
      }
      {technicalDetails && 
        <p className={styles.technicalDetails}>{technicalDetails}</p>
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