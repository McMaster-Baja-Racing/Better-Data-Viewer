//CreateGraphModal.js
import ReactDom from 'react-dom';
import '@styles/modalStyles.css';
import React, { useEffect, useState, useCallback } from 'react';
import { useRef } from 'react';
import SubteamPresets from '../SubteamPresets/SubteamPresets';
import Chart from '@components/views/Chart/Chart';
import { replaceViewAtIndex } from '@lib/viewUtils';
import {
  ChartInformation,
  ChartFileInformation,
  ChartAnalyzerInformation,
  Column,
  DataViewerPreset,
  GraphPreset,
} from '@types';
import { subteamGraphPresets } from '@lib/subteamGraphPresets';

export const SimpleCreateGraphModal = ({
  setModal,
  setViewInformation,
  viewInformation,
  buttonID,
  setNumViews,
  numViews,
  setVideo,
}) => {
  const [displayPage, setDisplayPage] = useState(0);

  const modalRef = useRef<HTMLDivElement>(null);
  const closeModal = (e) => {
    if (e.target === modalRef.current) {
      setModal('');
    }
  };

  //Stuff for handling final submit
  const handleSubmit = useCallback(() => {
    //TODO: Hardcoded bin name
    const selectedBin = '182848';
    const selectedPreset: DataViewerPreset = subteamGraphPresets[0];
    const currGraph: GraphPreset = selectedPreset.graphs[0];

    const columns: Column[] = [];
    const analyze: ChartAnalyzerInformation = {
      type: currGraph.analyser,
      analyzerValues: [],
    };
    for (let i = 0; i < currGraph.axes.length; i++) {
      columns.push({
        header: currGraph.axes[i],
        filename: selectedBin + '/' + currGraph.axisFiles[i],
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
  }, [
    buttonID,
    viewInformation,
    numViews,
    setVideo,
    setNumViews,
    setViewInformation,
  ]);

  // This method will update the displayPage state by the given amount
  const movePage = (amount) => {
    setDisplayPage(displayPage + amount);
  };

  useEffect(() => {
    if (displayPage === 1) {
      handleSubmit();
      setModal('');
    }
  }, [displayPage, 4, setModal, handleSubmit]);

  const pageSelect = (page) => {
    switch (page) {
      case 0:
        return <SubteamPresets movePage={movePage} />;
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
