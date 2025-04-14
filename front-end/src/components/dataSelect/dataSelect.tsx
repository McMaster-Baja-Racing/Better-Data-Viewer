import { useEffect, useState } from 'react';
import styles from './dataSelect.module.scss';
import { Dropdown, DropdownOption } from '@components/dropdown/Dropdown';
import { Button } from '@components/button/Button';
import TextField from '@components/textfield/TextField';
import sigma from '@assets/icons/sigma.svg';
import plus from '@assets/icons/add.svg';
import minus from '@assets/icons/remove.svg';
import trash from '@assets/icons/trash.svg';
import analyzerData from '@components/analyzerData';
import { AnalyzerType, ChartFileInformation, Column } from '@types';

interface DataSelectProps {
    sources: DropdownOption<string>[];
    dataTypes: DropdownOption<string>[];
    chartFileInformation: ChartFileInformation;
    bins: string[];
    onColumnUpdate: (columnIndex: number, updatedColumn: Partial<Column>) => void;
    onAnalyzerUpdate: (analyzerType?: AnalyzerType, analyzerValues?: string[]) => void;
}

export function DataSelect({ sources, dataTypes, onAnalyzerUpdate, onColumnUpdate, chartFileInformation }: DataSelectProps) {
    const [selectedSource, setSelectedSource] = useState<string>(sources[0].value);
    // TODO: Make this column smarter
    const [selectedDataType, setSelectedDataType] = useState<string>(chartFileInformation.columns[1].header);
    const [analyzer, setAnalyzer] = useState(analyzerData.find(analyzer => analyzer.code === chartFileInformation.analyze.type));
    const [isExpanded, setIsExpanded] = useState(false);
    const [analyzerValues, setAnalyzerValues] = useState<string[]>(
        (analyzer && analyzer.parameters) ? analyzer.parameters.map(param => param.default) : []
    );

    console.log(chartFileInformation)

    const analyzerOptions = analyzerData.map(analyzer => ({
        label: analyzer.title,
        value: analyzer
    }));

    useEffect(() => {
        onAnalyzerUpdate(analyzer?.code ?? undefined, analyzerValues);
    }, [analyzer, analyzerValues]);

    useEffect(() => {
        onColumnUpdate(0, { filename: selectedSource + '/' + selectedDataType + '.csv', header: "Timestamp (ms)" });
        onColumnUpdate(1, { filename: selectedSource + '/' + selectedDataType + '.csv', header: selectedDataType });
    }, [selectedSource, selectedDataType]);

    useEffect(() => {
        if (analyzer && analyzer.parameters) {
            setAnalyzerValues(analyzer.parameters.map(param => param.default));
        } else {
            setAnalyzerValues([]);
        }
    }, [analyzer]);

    const handleParameterChange = (index: number, newValue: string) => {
        setAnalyzerValues(prevValues => {
          const updatedValues = [...prevValues];
          updatedValues[index] = newValue;
          return updatedValues;
        });
      };

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
                    {analyzer?.parameters.map((param, index) => (
                        <div className={styles.column} key={index}>
                            <label className={styles.label}>{param.name}</label>
                            <TextField
                                title={param.name}
                                value={analyzerValues[index] || ''}
                                setValue={(newVal: string) => handleParameterChange(index, newVal)}
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
