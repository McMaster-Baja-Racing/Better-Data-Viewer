import { useState } from 'react';
import styles from './optionSquare.module.scss';
import graphImage from '../../assets/graph_image.png';

interface OptionSquareProps {
  label?: string;
  illustration?: string;
  isClicked?: boolean;
}

export const OptionSquare: React.FC<OptionSquareProps> = ({ label = "Option Title", illustration = graphImage, isClicked}) => {
    const [clicked, setClicked] = useState(isClicked);  // To track the click state

    const handleClick = () => {
        setClicked(prev => !prev); // Toggle clicked state
    };
    
    return (
<div className={`${styles.optionSquare} ${clicked ? styles.active : ''}`}  onClick={handleClick}>            
            <div className={styles.illustration}>
                {illustration ? <img src={illustration} alt="Illustration" /> : null}
            </div>
            <div className={styles.label}>
                   {label}
            </div>
        </div>
    );
}