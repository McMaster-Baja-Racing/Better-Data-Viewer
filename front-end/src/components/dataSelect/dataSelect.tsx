import { useState } from 'react';
import styles from './dataSelect.module.scss';
import { Dropdown, DropdownOption } from '@components/dropdown/Dropdown';
import { Button } from '@components/button/Button';
import TextField from '@components/textfield/TextField';
import sigma from '@assets/icons/sigma.svg';
import plus from '@assets/icons/add.svg';
import minus from '@assets/icons/remove.svg';
import trash from '@assets/icons/trash.svg';
import analyzerData from '@components/analyzerData';

interface DataSelectProps {
    sources: DropdownOption<string>[];
    dataTypes: DropdownOption<string>[];
}

export function DataSelect({ sources, dataTypes }: Readonly<DataSelectProps>) {
    const [selectedSource, setSelectedSource] = useState<string>(sources[0].value);
    const [selectedDataType, setSelectedDataType] = useState<string>(dataTypes[0].value);
    const [analyzer, setAnalyzer] = useState(analyzerData[0] || '');
    const [isExpanded, setIsExpanded] = useState(false);

    const analyzerOptions = analyzerData.map(analyzer => ({
        label: analyzer.title,
        value: analyzer
    }));

    return (
        <div className={styles.dataSelect}>
            <div className={styles.row}>
                <div className={styles.column}>
                    <label className={styles.label}>Source</label>
                    <Dropdown
                        options={sources}
                        selected={selectedSource}
                        setSelected={setSelectedSource}
                        className={styles.longDropDown}
                    />
                </div>
                <div className={styles.column}>
                    <label className={styles.label}>Data Type</label>
                    <Dropdown
                        options={dataTypes}
                        selected={selectedDataType}
                        setSelected={setSelectedDataType}
                        className={styles.longDropDown}
                    />
                </div>
                <div className={styles.column}>
                    <label className={styles.label}>Analyzer</label>
                    <Button
                        className={styles.toggle}
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <img src={sigma} alt="analyzer" className={styles.analyzerIcon} />
                        <img
                            src={isExpanded ? minus : plus}
                            alt="toggle"
                            className={styles.toggleIcon}
                        />
                    </Button>
                </div>
            </div>
            <div className={`${styles.analyzerOptions} ${isExpanded ? styles.expanded : ''}`}>
                <div className={styles.row}>
                    <div className={styles.column}>
                        <label className={styles.label}>Analyzer Type</label>
                        <Dropdown
                            options={analyzerOptions}
                            selected={analyzer}
                            setSelected={setAnalyzer}
                        />
                    </div>
                    {analyzer.parameters.map((param, index) => (
                        <div className={styles.column} key={index}>
                            <label className={styles.label}>Options</label>
                            <TextField
                                title={param.name}
                                value=""
                                setValue={() => {}}
                                placeholder={param.default}
                            />
                        </div>
                    ))}
                </div>
            </div>
            <img src={trash} alt="delete" className={styles.deleteIcon} />
        </div>
    );
}
