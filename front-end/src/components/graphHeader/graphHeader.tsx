import styles from './graphHeader.module.scss';
import { icons } from '@lib/assets';
import { Button } from '../button/Button';

interface GraphHeaderProps {
  title: string;
}

export function GraphHeader({ title }: GraphHeaderProps) {
  return (
    <div className={styles.graphHeader}>
      <div className={styles.title}>{title}</div>
      <div className={styles.buttons}>
        <Button
          text="Configure"
          icon={icons['settings']}
          onClick={() => {}}
          primary={true}
          paddingX="1.5rem"
          paddingY="0.3rem"
          textSize={16}
        />
        <Button
          text="Share Dashboard"
          icon={icons['upload']}
          onClick={() => {}}
          primary={true}
          paddingX="1.5rem"
          paddingY="0.3rem"
          textSize={16}
        />
      </div>
    </div>
  );
}