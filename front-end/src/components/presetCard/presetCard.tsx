import styles from './presetCard.module.scss';
import defaultImage from '@assets/preset_thumbnail.png';

interface PresetCardProps {
    image?: string;
    title: string;
    description: string;
    fileCount: number;
}

export function PresetCard({ image,title,description,fileCount }: GraphHeaderProps) {
    return (
    <div className={styles.presetCard}>
        <img src={image || defaultImage} alt={title} className={styles.image} />
    </div>
    );
};

