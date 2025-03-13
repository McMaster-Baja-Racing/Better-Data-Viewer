import React, { ReactNode, useState } from 'react';
import cx from 'classnames';
import styles from './GraphWrapper.module.scss';
import fullscreen from '@assets/icons/fullscreen.svg';
import unfullscreen from '@assets/icons/un-fullscreen.svg';
import write from '@assets/icons/write.svg';
import threedots from '@assets/icons/threedots.svg';


interface GraphWrapperProps {
    title: string;
    children: ReactNode;
}

export const GraphWrapper = ({ title, children }: GraphWrapperProps) => {
    
    const [clicked, setClicked] = useState(false);
    const handleClick = () => {
        setClicked(!clicked);
    }

   return (
    <div className={cx(styles.graphWrapper, { [styles.fullscreen]: clicked })}>
        <div className={styles.editBar}>
            <div className={styles.title}>{title}</div>
            <div className={styles.iconGroup}>
                <img src={write} className={styles.icon} />
                <img 
                        src={clicked ? unfullscreen : fullscreen} 
                        className={styles.icon} 
                        onClick={handleClick} 
                        style={{ cursor: 'pointer' }} 
                    />
                <img src={threedots} className={styles.icon} />
            </div>
        </div>
        <div className={styles.graphContainer}>
            {children}
        </div>
    </div>

   )
}