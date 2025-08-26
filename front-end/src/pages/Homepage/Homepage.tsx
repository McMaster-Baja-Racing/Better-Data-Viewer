import { TitleCard } from '@components/simple/titleCard/titleCard';
import { PresetList } from '@components/composite/presetList/PresetList';
import { Footer } from '@components/simple/footer/Footer';
import styles from './Homepage.module.scss';
import { DataViewerPreset } from '@types';
import { useModal } from '@contexts/ModalContext';
import { useNavigate } from 'react-router-dom';  // See if this works on Electron
import { useChartQuery } from '@contexts/ChartQueryContext';
import { useDashboard } from '@contexts/DashboardContext';
import { Series } from 'types/ChartQuery';

export const Homepage = () => {
  const { openModal } = useModal();
  const navigate = useNavigate();
  const { dispatch } = useChartQuery();
  const { dispatch: dashboardDispatch } = useDashboard();

  const onSubmit = (fileKeys: string[], preset: DataViewerPreset) => {
    const series: Series[] = [];

    // Extract sources (folder names) from file keys and add to dashboard context
    const sources = fileKeys.map(key => key.split('/')[0]);
    dashboardDispatch({ type: 'SET_SOURCES', sources });

    // TODO: Update fileKeys handling (bins) for multiple selected files
    preset.graphs.map((graph) => {
      series.push({
        x: {
          source: fileKeys[0],
          dataType: graph.axes[0].dataType,
        },
        y: {
          source: fileKeys[0],
          dataType: graph.axes[1].dataType,
        },
        analyzer: {
          type: graph.analyzer,
          options: graph.analyzerOptions
        }
      });
    });
    dispatch({ type: 'SET_SERIES', series});
    navigate('dataview');
  };

  const handleClick = (preset: DataViewerPreset) => {
    openModal('preset', {onSubmit: (x: string[]) => onSubmit(x, preset)});
  };

  return (
    <div className={styles.homepage}>
      <TitleCard />
      <div className={styles.body}>
        <PresetList handleClick={handleClick}/>
      </div>
      <div className={styles.footerWrapper}>
        <Footer />
      </div>
    </div>
  );

};