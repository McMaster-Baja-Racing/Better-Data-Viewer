import { useState } from 'react';
import styles from './optionSquare.module.scss';
import cx from 'classnames';

interface OptionSquareProps {
  label: string;
  illustration: string;
  isClicked: boolean;
}

export const OptionSquare = ({ label, illustration, isClicked}: OptionSquareProps) => {
    const [clicked, setClicked] = useState(isClicked); 

    const handleClick = () => {
        setClicked(prev => !prev);
    };
    
    return (
        <div className={cx(styles.optionSquare, { [styles.clicked]: clicked })} onClick={handleClick}>
        <div className={styles.illustration}>
                {illustration ? <img src={illustration} alt="Illustration" /> : null}
            </div>
            <div className={styles.label}>
                   {label}
            </div>
        </div>
    );
}