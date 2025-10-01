import { useState } from 'react';
import styles from './dataSelect.module.scss';
import { Dropdown } from '@components/ui/dropdown/Dropdown';
import { Column, analyzerConfig } from '@types';
import { sigmaIcon } from '@assets/icons';
import { useDashboard } from '@contexts/DashboardContext';
import { useModal } from '@contexts/ModalContext';

interface DataSelectProps {
  sources: { value: string; label: string }[];
  dataTypes: { value: string; label: string }[];
  columnKey: 'x' | 'y';
  seriesIndex: number;
  chartId: string;
  onColumnUpdate: (column: 'x' | 'y', updatedColumn: Partial<Column>) => void;
  onAnalyzerUpdate: (newAnalyzerType: string | null, newAnalyzerValues: unknown[] | undefined) => void;
}

export const DataSelect = ({
  sources,
  dataTypes,
  columnKey,
  seriesIndex,
  chartId,
  onColumnUpdate,
  onAnalyzerUpdate
}: DataSelectProps) => {
  const { openModal } = useModal();
  const { charts } = useDashboard();

  const chart = charts.find(c => c.id === chartId);
  const series = chart?.series[seriesIndex];

  if (!series) {
    return null;
  }

  const currentColumn = series[columnKey];
  const currentAnalyzer = series.analyzer;

  const [selectedSource, setSelectedSource] = useState(currentColumn?.source || '');
  const [selectedDataType, setSelectedDataType] = useState(currentColumn?.dataType || '');

  const handleSourceChange = (source: string) => {
    setSelectedSource(source);
    onColumnUpdate(columnKey, { source });
  };

  const handleDataTypeChange = (dataType: string) => {
    setSelectedDataType(dataType);
    onColumnUpdate(columnKey, { dataType });
  };

  const handleAnalyzerClick = () => {
    openModal('analyzer', {
      initialType: currentAnalyzer?.type,
      initialValues: currentAnalyzer?.options,
      onSubmit: onAnalyzerUpdate
    });
  };

  const getAnalyzerName = () => {
    if (!currentAnalyzer?.type) return 'None';
    const config = analyzerConfig[currentAnalyzer.type];
    return config?.name || 'Unknown';
  };

  return (
    <div className={styles.dataSelect}>
      <div className={styles.row}>
        <div className={styles.inputGroup}>
          <label>Source</label>
          <Dropdown
            options={sources}
            selected={selectedSource}
            setSelected={handleSourceChange}
            placeholder="Select a source"
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Data Type</label>
          <Dropdown
            options={dataTypes}
            selected={selectedDataType}
            setSelected={handleDataTypeChange}
            placeholder="Select a type"
          />
        </div>
      </div>
      {columnKey === 'y' && (
        <div className={styles.analyzerRow}>
          <label>Analyzer</label>
          <div className={styles.analyzerControl} onClick={handleAnalyzerClick}>
            <img src={sigmaIcon} alt="Analyzer" className={styles.analyzerIcon} />
            <span>{getAnalyzerName()}</span>
          </div>
        </div>
      )}
    </div>
  );
};