import { useState } from 'react';
import styles from './titleCard.module.scss';
import cx from 'classnames';

interface TitleCardProps {
    title: string;
    description: string;   
}

export const TitleCard = ({ title, description }: TitleCardProps) => {
    return (
        <div className={styles.titleCard}>
           <div className={styles.textContainer}>
            <div className={styles.title}>{title}</div>
            <div className={styles.description}>{description}</div>
            </div>
            <div className={styles.graph}>
                <p> yooo</p>
            </div>
        </div>
    );
}