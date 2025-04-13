import { useState } from 'react';
import styles from './dataSelect.module.scss';
import { Dropdown } from '@components/dropdown/Dropdown';
import { Button } from '@components/button/Button';
import TextField from '@components/textfield/TextField';
import sigma from '@assets/icons/sigma.svg';
import plus from '@assets/icons/add.svg';
import minus from '@assets/icons/remove.svg';
import trash from '@assets/icons/trash.svg';
import analyzerData from '@components/analyzerData';

interface DataSelectProps {
    sources: string[];
    dataTypes: string[];
}

export function DataSelect({ sources, dataTypes }: Readonly<DataSelectProps>) {
    const [selectedSource, setSelectedSource] = useState(sources[0] || '');
    const [selectedDataType, setSelectedDataType] = useState(dataTypes[0] || '');
    const [analyzer, setAnalyzer] = useState(analyzerData[0] || '');
    const [isExpanded, setIsExpanded] = useState(false);

    // Make a list of analyzers in the shape of
    // {label: (analyzer.title), value: analyzer}
    const analyzerOptions = analyzerData.map(analyzer => ({
        label: analyzer.title,
        value: analyzer
    }));

    // Also make a list of strings into a list of objects with label and value
    // {label: (source), value: source}
    const sources2 = sources.map(source => ({
        label: source,
        value: source
    }));
    const dataTypes2 = dataTypes.map(dataType => ({
        label: dataType,
        value: dataType
    }));

    return (
        <div className={styles.dataSelect}>
            <div className={styles.row}>
                <div className={styles.column}>
                    <label className={styles.label}>Source</label>
                    <Dropdown options={sources2} selected={selectedSource} setSelected={setSelectedSource} className={styles.longDropDown}/>
                </div>
                <div className={styles.column}>
                    <label className={styles.label}>Data Type</label>
                    <Dropdown options={dataTypes2} selected={selectedDataType} setSelected={setSelectedDataType} className={styles.longDropDown}/>
                </div>
                <div className={styles.column}>
                    <label className={styles.label}>Analyzer</label>
                    <Button className={styles.toggle} onClick={() => setIsExpanded(!isExpanded)} >
                        <img src={sigma} alt="analyzer" className={styles.analyzerIcon} />
                        <img src={isExpanded ? minus : plus} alt="toggle" className={styles.toggleIcon} />
                    </Button>
                </div>
            </div>
            {isExpanded && (
                <div className={styles.row}>
                    <div className={styles.column}>
                        <label className={styles.label}>Analyzer Type</label>
                        <Dropdown options={analyzerOptions} selected={analyzer} setSelected={setAnalyzer} />
                    </div>
                    {analyzer.parameters.map((param, index) => (
                        <div className={styles.column} key={index}>
                            <label className={styles.label}>Options</label>
                            <TextField title={param.name} value="" setValue={() => {}} placeholder={param.default}/>
                        </div>
                    ))}
                </div>
            )}
        <img src={trash} alt="delete" className={styles.deleteIcon}/>
        </div>
    );
}
