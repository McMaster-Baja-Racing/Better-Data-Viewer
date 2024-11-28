import '../../styles/lapTimes.css';
import React from 'react';

const SIGFIGS = 3;

const LapTimes = ({ laps, gotoTimeCallback }) => {
  if (laps.length === 0) {
    return (
      <>
        <p className='laptimes_helptext'>
                    Right click and drag to draw gates<br />
                    Choose the gate type at the top <br />
                    Place a start and end to show lap times<br />
        </p>
      </>
    );
  }
  return (
    <div className="laptimes_container">
      <a className="laptimes_download" download="laps.json" href={URL.createObjectURL(new Blob([
        JSON.stringify(laps.toSorted((a, b) => a.start - b.start), null, 4)
      ], { type: 'application/json' }))}>Download lap data</a>
      {laps.toSorted((a, b) => a.start - b.start).map((lap, index) => {
        return (
          <div key={[lap, index]} className="laptimes_lap">
            <button className="laptimes_accordion" onClick={() => gotoTimeCallback(lap.start)}>
              Lap {index}: {((lap.end - lap.start) / 1000).toFixed(SIGFIGS)}s 
              <span className="laptimes_drilldown">V</span>
            </button>
            <div className="laptimes_panel">
              <table>
                <tbody>
                  {lap.checkpoints.map((checkpoint, index) => {
                    return (
                      <tr className="laptimes_tr" key={[checkpoint, index]}>
                        <td>Checkpoint {index}</td>
                        <td>{((checkpoint - lap.start) / 1000).toFixed(SIGFIGS)}s</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );

};

export default LapTimes;