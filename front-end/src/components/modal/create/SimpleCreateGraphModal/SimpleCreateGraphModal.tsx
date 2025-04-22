import ReactDom from 'react-dom';
import '@styles/modalStyles.css';
import { useEffect, useState, useCallback, useRef } from 'react';
import PresetSelectionPage from '../PresetSelectionPage/PresetSelectionPage';
import { FileSelectionPage } from '../FileSelectionPage/FileSelectionPage';
import Chart from '@components/views/Chart/Chart';
import { replaceViewAtIndex } from '@lib/viewUtils';
import {
  ChartInformation,
  ChartFileInformation,
  ChartAnalyzerInformation,
  Column,
  DataViewerPreset,
} from '@types';

/**
 * Modal for creating a graph by choosing a filename and a graph preset
 * @param setModal Function used to set the modal, called with '' when we close this modal
 */
export const SimpleCreateGraphModal = ({
  setModal,
  setViewInformation,
  viewInformation,
  setNumViews,
}) => {
  const [selectedBinFile, setSelectedBinFile] = useState<string>('182848');
  const [selectedPreset, setSelectedPreset] = useState<DataViewerPreset | null>(null);
  const [displayPage, setDisplayPage] = useState(0);

  const modalRef = useRef<HTMLDivElement | null>(null);

  const closeModal = (e: React.MouseEvent) => {
    if (e.target === modalRef.current) {
      setModal('');
    }
  };

  const movePage = (amount: number) => {
    setDisplayPage((prev) => prev + amount);
  };

  // Handle final submit
  const handleSubmit = useCallback(() => {
    if (!selectedPreset || !selectedBinFile) return;

    const files: ChartFileInformation[] = selectedPreset.graphs.map((currGraph) => {
      // Build x, y, z columns explicitly
      const [xAxis, yAxis, zAxis] = currGraph.axes;
      const x: Column = {
        header: xAxis.axis,
        filename: `${selectedBinFile}/${xAxis.file}`,
        timespan: { start: null, end: null },
      };
      const y: Column = {
        header: yAxis.axis,
        filename: `${selectedBinFile}/${yAxis.file}`,
        timespan: { start: null, end: null },
      };
      const z: Column | null = zAxis
        ? {
            header: zAxis.axis,
            filename: `${selectedBinFile}/${zAxis.file}`,
            timespan: { start: null, end: null },
          }
        : null;

      const analyze: ChartAnalyzerInformation = {
        type: currGraph.analyzer,
        analyzerValues: currGraph.analyzerOptions,
      };

      return { x, y, z, analyze };
    });

    const chartInformation: ChartInformation = {
      files,
      live: false,
      type: selectedPreset.graphs[0].graphType,
      hasTimestampX: !files.some((file) => file.x.header !== 'Timestamp (ms)'),
      hasGPSTime: !files.some((file) => file.x.timespan.start == null),
    };

    // Replace the view
    const updatedViewInformation = replaceViewAtIndex(viewInformation, 0, {
      component: Chart,
      props: { chartInformation },
    });
    setViewInformation(updatedViewInformation);
    setNumViews(selectedPreset.graphs.length);
    setModal('');
  }, [selectedPreset, selectedBinFile, viewInformation, setViewInformation, setNumViews, setModal]);

  useEffect(() => {
    if (displayPage === 2) {
      handleSubmit();
    }
  }, [displayPage, handleSubmit]);

  const pageSelect = (page: number) => {
    switch (page) {
      case 0:
        return (
          <FileSelectionPage
            handleNextPage={(file) => {
              setSelectedBinFile(file);
              movePage(1);
            }}
          />
        );
      case 1:
        return (
          <PresetSelectionPage
            handleNextPage={(preset) => {
              setSelectedPreset(preset);
              movePage(1);
            }}
          />
        );
      default:
        return null;
    }
  };

  return ReactDom.createPortal(
    <div className="container" ref={modalRef} onClick={closeModal}>
      <div className="modal">
        {pageSelect(displayPage)}
        <button className="closeButton" onClick={() => setModal('')}>
          X
        </button>
      </div>
    </div>,
    document.getElementById('portal') as HTMLElement
  );
};