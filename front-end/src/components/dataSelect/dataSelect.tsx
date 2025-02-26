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

    return (
        <div className={styles.dataSelect}>
            <Dropdown options={sources} selected={selectedSource} setSelected={setSelectedSource} />
            <Dropdown options={dataTypes} selected={selectedDataType} setSelected={setSelectedDataType} />
        </div>
    );
}
