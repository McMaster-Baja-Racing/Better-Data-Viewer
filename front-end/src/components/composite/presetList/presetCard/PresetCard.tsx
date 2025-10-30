import styles from './PresetCard.module.scss';
import defaultImage from '@assets/preset_thumbnail.png';
import {newGraphIcon} from '@assets/icons';

interface PresetCardProps {
    image?: string;
    name: string;
    description: string;
    fileCount: number;
    onClick: () => void;
}

export const PresetCard = ({ image, name, description, fileCount, onClick }: PresetCardProps) => {
  return (
    <button className={styles.presetCard} onClick={onClick}>
      <img src={image ?? defaultImage} alt="Preset" className={styles.image} />
      <div className={styles.content}>
        <div className={styles['title-container']}>
          <div className={styles.title}>{name}</div>
          <div className={styles.fileCount}>
            <span>{fileCount} x</span>
            <img src={newGraphIcon} alt="New Graph" />
          </div>
        </div>
        <div className={styles.description}>{description}</div>
      </div>
    </button>
  );
};

