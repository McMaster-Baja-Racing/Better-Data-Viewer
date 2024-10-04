import '@styles/modalStyles.css';
import Help from '../Help/Help';
import analyzerData from '@components/analyzerData';
import './AnalyzersAndSeries.css';
import React, { useState, useEffect } from 'react';
const AnalyzersAndSeries = ({
  dimensions,
  columns,
  movePage,
  seriesInfo,
  setSeriesInfo,
  setSuccessMessage,
  setDimensions,
  graphType,
  fileTimespans
}) => {

  // Determines if a series already exists with the same columns and analyzer
  const isDuplicateSeries = (newSeries) => {
    return seriesInfo.some((series) => {
      const isSameColumns = JSON.stringify(series.columns) === JSON.stringify(newSeries.columns);
      const isSameAnalyzer = series.analyze.type === newSeries.analyze.type;
      return isSameColumns && isSameAnalyzer;
    });
  };

  const columnGenerator = (n) => {
    // TODO: Refactor this so that it doesn't use variables such as "arr" and "arr2"
    // TODO: Further should be more dynamic, so that it can handle 
    // any number of dimensions in a "smart" way (probably using some css)
    let arr = [];
    for (let i = 0; i < 2; i++) {
      arr.push(
        <div key={`axis-${i}`}>
          <div className="boldText">{i === 0 ? 'X-Axis' : 'Y Axis'} </div>
          <select className={i} defaultValue={JSON.stringify(columns[i])}>
            {columns.map(column => (
              <option
                value={JSON.stringify(column)}
                key={column.header + column.filename}
              >
                {column.filename} - {column.header}
              </option>
            ))}
          </select>
        </div>
      );
    }
    let arr2 = [];
    if (n === 3) {
      arr2.push(
        <br key="axis-br"></br>,
        <div key={'axis-3'}>
          <div className="boldText">Z Axis</div>
          <select className={2} key={2} defaultValue={JSON.stringify(columns[2])}>
            {columns.map(column => (
              <option
                value={JSON.stringify(column)}
                key={column.header + column.filename}
              >
                {column.filename} - {column.header}
              </option>
            ))}
          </select>
        </div>
      );
    }
    return <div><div className='columnHeaders'>{arr}</div> <div className='columnHeaders2'>{arr2}</div></div>;
  };

  const addSeries = (nextPage) => {

    var selectColumns = [];
    for (let i = 0; i < dimensions; i++) {
      const columnJSON = JSON.parse(document.getElementsByClassName(i)[0].value);
      const fileTimespan = fileTimespans.find(timespan => timespan.key === columnJSON.filename);
      columnJSON['timespan'] = {start: fileTimespan?.start ?? '', end: fileTimespan?.end ?? ''};
      selectColumns.push(columnJSON);
    }

    var checkedAnalyzer = analyzerData.filter(analyzer => document.getElementById(analyzer.title).checked)[0];

    // Create the new series
    const newSeries = {
      'columns': selectColumns,
      'analyze': {
        'type': checkedAnalyzer.code,
        'analyzerValues': checkedAnalyzer.parameters.map(param => {
          const value = document.getElementById(param.name).value;
          return value === '' ? null : value;
        })
      }
    };

    const duplicateSeries = isDuplicateSeries(newSeries);

    // Add the new series to the seriesInfo state only if it is not a duplicate
    setSeriesInfo(duplicateSeries ? seriesInfo : [...seriesInfo, newSeries]);

    // Display a success message if the series is not a duplicate or if the user is moving to the next page
    // Moving to the next page does not fail on a duplicate series so the message is still displayed in that case
    const successMessage = (!nextPage && duplicateSeries)
      ? { message: 'Duplicate Series' }
      : { message: nextPage ? 'Graph Created' : 'Series Added' };
    setSuccessMessage(successMessage);
  };

  const [openPopup, setOpenPopup] = useState(null);

  // TODO: Very hardcoded in, should be based off of a list of graph types and their respetive dimensions
  // TODO: Gauge should have 1 dimension, line should have 2, etc.
  useEffect(() => {
    if (graphType === 'coloredline') {
      setDimensions(3);
    } else {
      setDimensions(2);
    }
  }, [graphType, setDimensions]);

  return (
    <div className="analyzersAndSeriesContainer">
      <h3>Select Axis</h3>
      {columnGenerator(dimensions)}
      <h3>Select Analyzer</h3>
      <div className="analyzerContainer">
        {analyzerData.map((analyzer) => {
          return (
            <div className="analyzerBox" key={analyzer.title}>
              <input
                type="radio"
                id={analyzer.title}
                name="analyzerChoice"
                value="true"
                defaultChecked={analyzer.checked}
              />
                            
              {analyzer.parameters.length > 0 ? (
                <details>
                  <summary><strong>{analyzer.title}</strong></summary>
                  {analyzer.parameters.map((param, index) => {
                    return (
                      <div className="parambox" key={`param-${index}`}>
                        <label htmlFor={`param${index}`}>{`${param.name} →`}</label>
                        <input type="number" id={param.name} className={`param${index}`} defaultValue={param.default} />
                      </div>
                                            
                    );
                  })}
                </details>
              ) : (
                <label><strong>{analyzer.title}</strong></label>
              )}
              <div className="info">
                <Help data={analyzer} openPopup={openPopup} setOpenPopup={setOpenPopup}/>
              </div>
              <br></br>
            </div>
          );
        }
        )}
      </div>
      <div className="buttonFlexBox">
        <button className="pageThreeBackButton" onClick={() => { movePage(-1); }}>Back</button>
        <button className="addSeries" onClick={() => {addSeries(false); }}>Add Series</button>
        <button className="pageThreeNextButton" onClick={() => {addSeries(true); movePage(1); }}>Submit</button>
      </div>
    </div>
  );

};

export default AnalyzersAndSeries;