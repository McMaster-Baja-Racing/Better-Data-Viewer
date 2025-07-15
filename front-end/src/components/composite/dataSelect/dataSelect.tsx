import { useEffect, useState } from 'react';
import styles from './dataSelect.module.scss';
import { Dropdown, DropdownOption } from '@components/ui/dropdown/Dropdown';
import { Button } from '@components/ui/button/Button';
import TextField from '@components/ui/textfield/TextField';
import { sigmaIcon, plusIcon, minusIcon } from '@assets/icons';
import { unstable_batchedUpdates } from 'react-dom';
import { analyzerConfig, AnalyzerKey, AnalyzerType, Column, DataColumnKey } from '@types';
import { useChartQuery } from '../../../ChartQueryContext';

interface DataSelectProps {
    sources: DropdownOption<string>[];
    dataTypes: DropdownOption<string>[];
    columnKey: DataColumnKey;
    onColumnUpdate: (column: DataColumnKey, updatedColumn: Partial<Column>) => void;
    onAnalyzerUpdate: (analyzerType?: AnalyzerType | null, analyzerValues?: string[]) => void;
}

const TIMESTAMP_HEADER = 'Timestamp (ms)';

function isJoinAnalyzer(key?: AnalyzerKey | null): key is AnalyzerType {
  return !!key && analyzerConfig[key].isJoinBased;
}

export function DataSelect({ 
  sources, 
  dataTypes, 
  columnKey, 
  onAnalyzerUpdate, 
  onColumnUpdate, 
}: DataSelectProps) {
  const [selectedSource, setSelectedSource] = useState<string>(sources[0].value);
  const { series } = useChartQuery();
  const singleSeries = series[0]; // TODO: Handle multiple series
  const [selectedDataType, setSelectedDataType] = useState<string>(
    singleSeries[columnKey]?.header || dataTypes[0].value
  );

  const [analyzerKey, setAnalyzerKey] = useState<AnalyzerKey>(singleSeries.analyzer.type ?? 'NONE');
  const analyzer = analyzerConfig[analyzerKey];

  const [isExpanded, setIsExpanded] = useState(false);
  const [analyzerValues, setAnalyzerValues] = useState<string[]>(
    analyzer.parameters?.map(param => param.defaultValue) || []
  );

  const analyzerOptions = (Object.entries(analyzerConfig) as [AnalyzerKey, typeof analyzer][])
    .map(([key, cfg]) => ({
      label: cfg.title,
      value: key
    }));

  // Update analyzer type
  useEffect(() => {
    const newKey: AnalyzerKey = singleSeries.analyzer.type ?? 'NONE';
    setAnalyzerKey(newKey);
    setAnalyzerValues(analyzerConfig[newKey].parameters?.map(param => param.defaultValue) || []);
  }, [singleSeries.analyzer.type]);

  // Wait before API call
  useEffect(() => {
    // wait until values array matches expected length
    if (analyzer.parameters && analyzerValues.length !== (analyzer.parameters?.length || 0)) {
      return;
    }
    onAnalyzerUpdate(analyzerKey === 'NONE' ? null : analyzerKey, analyzerValues);
  }, [analyzerKey, analyzerValues]);

  // TODO: This logic could be decoupled from this
  useEffect(() => {
    const currX = singleSeries.x.header;
    const update: Partial<Column> = { header: selectedDataType };

    unstable_batchedUpdates(() => {
      if (columnKey === 'y') {
        update.filename = `${selectedSource}/${selectedDataType}.csv`;
        if (currX === TIMESTAMP_HEADER) {
          onColumnUpdate('x', { filename: update.filename });
        } else if (!isJoinAnalyzer(analyzerKey)) {
          onAnalyzerUpdate(AnalyzerType.INTERPOLATER_PRO, []);
        }
      } else if (columnKey === 'x') {
        if (selectedDataType === TIMESTAMP_HEADER && isJoinAnalyzer(analyzerKey)) {
          onAnalyzerUpdate(null, []);
          onColumnUpdate('x', { filename: singleSeries.y.filename });
        } else if (selectedDataType !== TIMESTAMP_HEADER && isJoinAnalyzer(analyzerKey)) {
          update.filename = `${selectedSource}/${selectedDataType}.csv`;
        } else if (selectedDataType !== TIMESTAMP_HEADER) {
          update.filename = `${selectedSource}/${selectedDataType}.csv`;
          onAnalyzerUpdate(AnalyzerType.INTERPOLATER_PRO, []);
        }
      }
  
      onColumnUpdate(columnKey, update);
    });
  }, [selectedSource, selectedDataType]);

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
            <img src={sigmaIcon} alt="analyzer" className={styles.analyzerIcon} />
            <img
              src={isExpanded ? minusIcon : plusIcon}
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
              selected={analyzerKey}
              setSelected={setAnalyzerKey}
            />
          </div>
          {analyzer?.parameters?.map((param, index) => (
            <div className={styles.column} key={index}>
              <label className={styles.label}>{param.name}</label>
              <TextField
                title={param.name}
                value={analyzerValues[index] || ''}
                setValue={(newVal: string) => handleParameterChange(index, newVal)}
                placeholder={param.defaultValue}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
