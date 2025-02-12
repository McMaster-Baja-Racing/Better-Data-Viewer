import styles from './graphHeader.module.scss';
import { icons } from '@lib/assets';

interface GraphHeaderProps {
    title: string;
  }
  
  export function GraphHeader({ title }: GraphHeaderProps) {
    return (
      <div className={styles.graphHeader}>
        <div className={styles['title-group']}>
            Drivetrain Preset

        </div>
        <div className={styles.buttons}>
                meow
            </div>
      </div>
    );
  }