import styles from './presetCard.module.scss';
import defaultImage from '@assets/preset_thumbnail.png';

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
        </div>
      </div>
    );
};

