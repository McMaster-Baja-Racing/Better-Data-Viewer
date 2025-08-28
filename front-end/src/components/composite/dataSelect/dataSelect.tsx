import { useEffect, useState } from 'react';
import styles from './dataSelect.module.scss';
import { Dropdown, DropdownOption } from '@components/ui/dropdown/Dropdown';
import { Button } from '@components/ui/button/Button';
import TextField from '@components/ui/textfield/TextField';
import { sigmaIcon, plusIcon, minusIcon } from '@assets/icons';
import { analyzerConfig, AnalyzerKey, AnalyzerType, DataColumnKey, DataTypes } from '@types';
import { useChartQuery } from '@contexts/ChartQueryContext';
import { useDashboard } from '@contexts/DashboardContext';
import { useModal } from '@contexts/ModalContext';
import { Column } from 'types/ChartQuery';

interface DataSelectProps {
    sources: DropdownOption<string>[];
    dataTypes: DropdownOption<DataTypes>[];
    columnKey: DataColumnKey;
    seriesIndex?: number; // Add series index to track which series we're editing
    onColumnUpdate: (column: DataColumnKey, updatedColumn: Partial<Column>) => void;
    onAnalyzerUpdate: (analyzerType?: AnalyzerType | null, analyzerValues?: string[]) => void;
}

export function DataSelect({ 
  sources, 
  dataTypes, 
  columnKey, 
  seriesIndex = 0,
  onAnalyzerUpdate, 
  onColumnUpdate,
}: DataSelectProps) {
  const { series } = useChartQuery();
  const { dispatch: dashboardDispatch } = useDashboard();
  const { openModal, closeModal } = useModal();
  const currentSeries = series[seriesIndex];
  
  // Initialize with current series values or empty strings
  const [selectedSource, setSelectedSource] = useState<string>(currentSeries?.[columnKey]?.source || '');
  const [selectedDataType, setSelectedDataType] = useState<string>(currentSeries?.[columnKey]?.dataType || '');

  const [analyzerKey, setAnalyzerKey] = useState<AnalyzerKey>(currentSeries?.analyzer.type ?? 'NONE');
  const analyzer = analyzerConfig[analyzerKey];

  const [isExpanded, setIsExpanded] = useState(false);
  const [analyzerValues, setAnalyzerValues] = useState<string[]>(
    currentSeries?.analyzer?.options || analyzer.parameters?.map(param => param.defaultValue) || []
  );

  // Only add placeholder options if current selection is empty
  const baseSourceOptions = selectedSource === '' 
    ? [{ label: 'Select a source...', value: '' }, ...sources]
    : sources;

  // Add "View all sources" option at the bottom
  const sourceOptions = [
    ...baseSourceOptions,
    { label: '+ View all sources', value: '___VIEW_ALL___' }
  ];
  
  const dataTypeOptions = selectedDataType === '' 
    ? [{ label: 'Select a data type...', value: '' }, ...dataTypes]
    : dataTypes;

  const analyzerOptions = (Object.entries(analyzerConfig) as [AnalyzerKey, typeof analyzer][])
    .map(([key, cfg]) => ({
      label: cfg.title,
      value: key
    }));

  // Sync state when series changes externally
  useEffect(() => {
    if (currentSeries) {
      setSelectedSource(currentSeries[columnKey]?.source || '');
      setSelectedDataType(currentSeries[columnKey]?.dataType || '');
    }
  }, [currentSeries, columnKey]);

  // Update analyzer type
  useEffect(() => {
    if (!currentSeries) return;
    const newKey: AnalyzerKey = currentSeries.analyzer.type ?? 'NONE';
    setAnalyzerKey(newKey);
    setAnalyzerValues(analyzerConfig[newKey].parameters?.map(param => param.defaultValue) || []);
  }, [currentSeries?.analyzer.type]);

  // update analyzer
  useEffect(() => {
    // wait until values array matches expected length
    if (analyzer.parameters && analyzerValues.length !== (analyzer.parameters?.length || 0)) {
      return;
    }
    onAnalyzerUpdate(analyzerKey === 'NONE' ? null : analyzerKey, analyzerValues);
  }, [analyzerKey, analyzerValues]);

  // Update column
  useEffect(() => {
    onColumnUpdate(columnKey, { dataType: selectedDataType, source: selectedSource });
  }, [selectedSource, selectedDataType]);

  const handleParameterChange = (index: number, newValue: string) => {
    setAnalyzerValues(prevValues => {
      const updatedValues = [...prevValues];
      updatedValues[index] = newValue;
      return updatedValues;
    });
  };

  const handleSourceSelection = (value: string) => {
    if (value === '___VIEW_ALL___') {
      // Trigger the view all sources callback
      openModal('preset', {
        onSubmit: (fileKeys: string[]) => {
          dashboardDispatch({ type: 'SET_SOURCES', sources: fileKeys.map(key => key.split('/')[0]) });
          closeModal();
        },
        currentSources: sources
      });
      // Don't update the selected source
      return;
    }
    // Normal source selection
    setSelectedSource(value);
  };

  return (
    <div className={styles.dataSelect}>
      <div className={styles.row}>
        <div className={styles.column}>
          <label className={styles.label}>Source</label>
          <Dropdown
            options={sourceOptions}
            selected={selectedSource}
            setSelected={handleSourceSelection}
            className={styles.longDropDown}
          />
        </div>
        <div className={styles.column}>
          <label className={styles.label}>Data Type</label>
          <Dropdown
            options={dataTypeOptions}
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
