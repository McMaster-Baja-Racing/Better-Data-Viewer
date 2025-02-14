import styles from './presetCard.module.scss';
import defaultImage from '@assets/preset_thumbnail.png';
import { icons } from '@lib/assets';

interface PresetCardProps {
    image?: string;
    title: string;
    description: string;
    fileCount: number;
}

export function PresetCard({ image,title,description,fileCount }: PresetCardProps) {
    return (
        <div className={styles.presetCard}>
        <img src={image || defaultImage} alt="Preset" className={styles.image} />
        <div className={styles.content}>
            <div className={styles['title-container']}>
                <div>{title}</div>
                <div className={styles.fileCount}>
                    <span>{fileCount} x</span>
                <img src={icons['newGraph']} alt="New Graph" />
            </div>
            </div>
            <div className={styles.description}>{description}</div>
        </div>
      </div>
    );
};

