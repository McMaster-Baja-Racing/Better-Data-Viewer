//CreateGraphModal.js
import ReactDom from 'react-dom';
import '@styles/modalStyles.css';
import React, { useEffect, useState, useCallback } from 'react';
import { useRef } from 'react';
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

  const modalRef: React.RefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null);
  
  const closeModal = (e) => {
    if (e.target === modalRef.current) {
      setModal('');
    }
  };

  const movePage = (amount) => { 
    setDisplayPage(displayPage + amount);
  };

  //Stuff for handling final submit
  const handleSubmit = useCallback(() => {
    if(selectedPreset == null || selectedBinFile == null)
    {
      return;
    }
    for(const currGraph of selectedPreset.graphs)
    {
      const columns: Column[] = [];
      const analyze: ChartAnalyzerInformation = {
        type: currGraph.analyzer,
        analyzerValues: currGraph.analyzerOptions,
      };
      for (let i = 0; i < currGraph.axes.length; i++) {
        columns.push({
          header: currGraph.axes[i].axis,
          filename: selectedBinFile + '/' + currGraph.axes[i].file,
          timespan: { start: null, end: null },
        });
      }
      const chartInformationFiles: ChartFileInformation[] = [
        {
          columns: columns,
          analyze: analyze,
        },
      ];
  
      const chartInformation: ChartInformation = {
        files: chartInformationFiles,
        live: false,
        type: currGraph.graphType,
        // Only true if all files have Timestamp (ms) as the first column
        hasTimestampX: !chartInformationFiles.some(
          (file) => file.columns[0].header !== 'Timestamp (ms)'
        ),
        // Only true if all files have a timespan from the GPS data
        hasGPSTime: !chartInformationFiles.some(
          (file) => file.columns[0].timespan.start == null
        ),
      };
      
      const updatedViewInformation = replaceViewAtIndex(viewInformation, 0, {
        component: Chart,
        props: { chartInformation },
      });
      setViewInformation(updatedViewInformation);
    }    
    setModal('');
    setNumViews(selectedPreset.graphs.length)
  }, [
    viewInformation,
    setViewInformation,
    selectedPreset,
    selectedBinFile
  ]);
  
  useEffect(() => {
    if (displayPage === 2) {
      handleSubmit();
      setModal('');
    }
  }, [displayPage, setModal, handleSubmit]);

  const pageSelect = (page) => {
    switch (page) {
      case 0:
        return <FileSelectionPage handleNextPage={(file) => {
          setSelectedBinFile(file);
          movePage(1);
        }} />;
      case 1:
        return <PresetSelectionPage handleNextPage={(preset) => {
          setSelectedPreset(preset);
          movePage(1);
        }} />;
      default:
        break;
    }
  };

  //render the modal JSX in the portal div.
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
