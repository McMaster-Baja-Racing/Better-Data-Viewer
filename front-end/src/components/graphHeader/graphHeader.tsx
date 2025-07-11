import styles from './graphHeader.module.scss';
import { icons } from '@lib/assets';
import { Button } from '../button/Button';

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
          <img src={icons['settings']} alt="settings" />
        </Button>
        <Button
          onClick={() => {/* */}} //TODO: fill this in when functionality is added
          primary={true}
          paddingX="1.5rem"
          paddingY="0.3rem"
        >
          <span>Share Dashboard</span>
          <img src={icons['upload']} alt="upload" />
        </Button>
      </div>
    </div>
  );
}