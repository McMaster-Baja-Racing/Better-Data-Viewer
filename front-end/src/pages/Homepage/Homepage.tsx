import { TitleCard } from '@components/simple/titleCard/titleCard';
import { PresetList } from '@components/composite/presetList/PresetList';
import { Footer } from '@components/simple/footer/Footer';
import styles from './Homepage.module.scss';
import { DataViewerPreset } from '@types';
import { useModal } from '../../ModalContext';
import { useNavigate } from 'react-router-dom';  // See if this works on Electron
import { useChartQuery } from '../../ChartQueryContext';
import { seriesT } from 'types/ChartQuery';

export const Homepage = () => {
  const { openModal } = useModal();
  const navigate = useNavigate();
  const { dispatch } = useChartQuery();

  const onSubmit = (fileKeys: string[], preset: DataViewerPreset) => {
    const series: seriesT[] = [];

    console.log('Preset:', preset);
    console.log('File keys:', fileKeys);

    // TODO: Update fileKeys handling (bins) for multiple selected files
    preset.graphs.map((graph) => {
      series.push({
        x: {
          filename: fileKeys[0] + '/' + graph.axes[0].file,
          header: graph.axes[0].axis,
        },
        y: {
          filename: fileKeys[0] + '/' + graph.axes[1].file,
          header: graph.axes[1].axis,
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
    openModal('preset', {onSubmit: onSubmit, preset: preset});
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