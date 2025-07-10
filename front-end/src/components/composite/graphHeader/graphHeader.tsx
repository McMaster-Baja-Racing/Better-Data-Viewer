import styles from './graphHeader.module.scss';
import settingsIcon from '@assets/icons/settings.svg';
import uploadIcon from '@assets/icons/upload.svg';
import { Button } from '../../ui/button/Button';

interface GraphHeaderProps {
  readonly title: string;
}

export function GraphHeader({ title }: GraphHeaderProps) {
  return (
    <div className={styles.graphHeader}>
      <div className={styles.title}>{title}</div>
      <div className={styles.buttons}>
        <Button
          onClick={() => {/* */}} //TODO: fill this in when functionality is added
          primary={true}
          paddingX="1.5rem"
          paddingY="0.3rem"
        >
          <span>Configure</span>
          <img src={settingsIcon} alt="settings" />
        </Button>
        <Button
          onClick={() => {/* */}} //TODO: fill this in when functionality is added
          primary={true}
          paddingX="1.5rem"
          paddingY="0.3rem"
        >
          <span>Share Dashboard</span>
          <img src={uploadIcon} alt="upload" />
        </Button>
      </div>
    </div>
  );
}