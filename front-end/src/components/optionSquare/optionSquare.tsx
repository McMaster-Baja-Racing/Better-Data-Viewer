import { useState } from 'react';
import styles from './optionSquare.module.scss';
import cx from 'classnames';
import checkMark from '../../assets/icons/checkmark.svg';

interface OptionSquareProps {
  label: string;
  illustration: string;
  clicked: boolean;
  setClicked: (clicked: boolean) => void;
}

export const OptionSquare = ({ label, illustration, clicked, setClicked}: OptionSquareProps) => {
    
    const handleClick = () => {
        setClicked(!clicked);
    };

    return (
        <div className={cx(styles.optionSquare, { [styles.clicked]: clicked })} onClick={handleClick}>
        <div className={styles.illustration}>
                <img src={illustration} alt="Illustration" />
            </div>
            <div className={styles.labelContainer}>
            {clicked && <img src={checkMark} alt="Selected" className={styles.checkMark} />}
                <span className={styles.label}>{label}</span>
            </div>
        </div>
    );
}