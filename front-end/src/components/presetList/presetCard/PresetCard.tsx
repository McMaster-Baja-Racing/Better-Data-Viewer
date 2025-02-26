import styles from './presetCard.module.scss';
import defaultImage from '@assets/preset_thumbnail.png';
import { icons } from '@lib/assets';

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
                <div>{name}</div>
                <div className={styles.fileCount}>
                    <span>{fileCount} x</span>
                <img src={icons['newGraph']} alt="New Graph" />
            </div>
            </div>
            <div className={styles.description}>{description}</div>
        </div>
      </button>
    );
};

