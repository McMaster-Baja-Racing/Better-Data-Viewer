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
import { AnalyzerType, ChartFileInformation, Column, DataColumnKey } from '@types';

interface DataSelectProps {
    sources: DropdownOption<string>[];
    dataTypes: DropdownOption<string>[];
    chartFileInformation: ChartFileInformation;
    columnKey: DataColumnKey;
    onColumnUpdate: (column: DataColumnKey, updatedColumn: Partial<Column>) => void;
    onAnalyzerUpdate: (analyzerType?: AnalyzerType | null, analyzerValues?: string[]) => void;
}

export function DataSelect({ sources, dataTypes, columnKey, onAnalyzerUpdate, onColumnUpdate, chartFileInformation }: DataSelectProps) {
    const [selectedSource, setSelectedSource] = useState<string>(sources[0].value);
    const [selectedDataType, setSelectedDataType] = useState<string>(chartFileInformation[columnKey]?.header || dataTypes[0].value);
    const [analyzer, setAnalyzer] = useState<analyzerData>(analyzerData.find(analyzer => analyzer.code === chartFileInformation.analyze.type) || analyzerData[0]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [analyzerValues, setAnalyzerValues] = useState<string[]>(
        (analyzer && analyzer.parameters) ? analyzer.parameters.map(param => param.default) : []
    );

    const analyzerOptions = analyzerData.map(analyzer => ({
        label: analyzer.title,
        value: analyzer
    }));

    useEffect(() => {
        setAnalyzer(analyzerData.find(analyzer => analyzer.code === chartFileInformation.analyze.type) || analyzerData[0]);
        setAnalyzerValues(analyzer.parameters.map(param => param.default));
    }, [chartFileInformation.analyze.type]);

    useEffect(() => {
        // wait until values array matches expected length
        if (analyzer.parameters && analyzerValues.length !== analyzer.parameters?.length || 0) {
            return;
        }
        onAnalyzerUpdate(analyzer.code, analyzerValues);
    }, [analyzer, analyzerValues]);

    useEffect(() => {
        // TODO: Update this logic to handle situations for interpolation
        const currX = chartFileInformation.x.header;

        const update: Partial<Column> = { header: selectedDataType };

        if (columnKey === 'y' && currX === "Timestamp (ms)") {
            // Update Y and X is time
            update.filename = `${selectedSource}/${selectedDataType}.csv`;
            onColumnUpdate('x', {filename: update.filename});
        } else if (columnKey === 'y') {
            // Update Y and X is not time
            update.filename = `${selectedSource}/${selectedDataType}.csv`;
            setAnalyzer(analyzerData[4]); // Set to Interpolation Analyzer
        } else if (columnKey === 'x' && selectedDataType !== "Timestamp (ms)") {
            // Update X and X is not time
            update.filename = `${selectedSource}/${selectedDataType}.csv`;
            setAnalyzer(analyzerData[4]); // Set to Interpolation Analyzer
        } else if (columnKey === 'x' && analyzer.code === AnalyzerType.INTERPOLATER_PRO) {
            // Update X and X is time, abd was interpolation
            onAnalyzerUpdate(null, []); // Remove analyzer
            setAnalyzer(analyzerData[0]); // Remove analyzer
            onColumnUpdate('x', {filename: chartFileInformation.y.filename});
        }
        
        onColumnUpdate(columnKey, update);
    }, [selectedSource, selectedDataType]);

    useEffect(() => {
        if (analyzer.parameters) {
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
                        disabled={columnKey === 'x'}
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
