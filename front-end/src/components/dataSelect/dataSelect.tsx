import { useState } from 'react';
import styles from './dataSelect.module.scss';
import { Dropdown } from '@components/dropdown/Dropdown';

interface DataSelectProps {
    sources: string[];
    dataTypes: string[];
}

export function DataSelect({ sources, dataTypes }: Readonly<DataSelectProps>) {
    const [selectedSource, setSelectedSource] = useState(sources[0] || '');
    const [selectedDataType, setSelectedDataType] = useState(dataTypes[0] || '');
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className={styles.dataSelect}>
            <div className={styles.row}>
                <div className={styles.column}>
                    <label className={styles.label}>Source</label>
                    <Dropdown options={sources} selected={selectedSource} setSelected={setSelectedSource} />
                </div>
                <div className={styles.column}>
                    <label className={styles.label}>Data Type</label>
                    <Dropdown options={dataTypes} selected={selectedDataType} setSelected={setSelectedDataType} />
                </div>
                <button className={styles.toggle} onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? 'Σ−' : 'Σ+'}
                </button>
            </div>
        </div>
    );
}
