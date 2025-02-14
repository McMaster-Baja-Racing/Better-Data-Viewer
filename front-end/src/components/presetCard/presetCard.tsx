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
                <div>Shift Curve and Speed vs Time</div>
                <div className={styles.fileCount}>
                    <span>3 x</span>
                <img src={icons['newGraph']} alt="New Graph" />
            </div>
            </div>
            <div className={styles.description}>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad...</div>
        </div>
      </div>
    );
};

