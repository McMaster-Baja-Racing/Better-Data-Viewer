import { useState } from 'react';
import styles from './titleCard.module.scss';
import cx from 'classnames';
import Chart from '../views/Chart/Chart';

interface TitleCardProps {
    description: string;   
}

export const TitleCard = ({ description }: TitleCardProps) => {
    return (
        <div className={styles.titleCard}>
           <div className={styles.textContainer}>
            <div className={styles.title}>
            <span className={styles.highlight1}>VISUALIZE</span> YOUR <br/>
            DATA, <span className={styles.highlight2}>YOUR WAY </span>
            </div>
            <div className={styles.description}>{description}</div>
            </div>
            <div className={styles.graph}>
                <Chart 
                    data={[]}
                    options={{}}
                    type="line"
                    height={200}
                    width={200}
                />
            </div>
        </div>
    );
}