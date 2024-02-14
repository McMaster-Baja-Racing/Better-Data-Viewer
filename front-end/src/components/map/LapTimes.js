import { useState } from 'react';
import '../../styles/lapTimes.css';

const SIGFIGS = 3;

const LapTimes = ({ laps }) => {
    const [closedIndices, setClosedIndices] = useState({0: false});
    function toggleOpen(index) {
        if(closedIndices[index]) {
            setClosedIndices({...closedIndices, [index]: false});
        } else {
            setClosedIndices({...closedIndices, [index]: true});
        }
    }
    if(laps.length === 0) {
        return(
            <h1 style={{color: "black", fontSize: "21px"}}>Put down a start and end block to show lap times</h1>
        )
    }
    return (
        <div className="laptimes_container">
            {laps.toSorted((a, b) => a.start - b.start).map((lap, index) => {
                return (
                    <div key={[lap, index]} className="laptimes_lap">
                        <button className="laptimes_accordion" onClick={() => toggleOpen(index)}>Lap {index}: {((lap.end - lap.start) / 1000).toFixed(SIGFIGS)}s <span className="laptimes_drilldown">V</span></button>
                        <div className="laptimes_panel" style={{display: closedIndices[index] ? "none" : 'block'}}>
                            <table style={{width: "100%"}}>
                                <tbody>
                                    {lap.checkpoints.map((checkpoint, index) => {
                                        return (
                                            <tr className="laptimes_tr" key={[checkpoint, index]}>
                                                <td>Checkpoint {index}</td>
                                                <td>{((checkpoint-lap.start)/1000).toFixed(SIGFIGS)}s</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )
            })}
        </div>
    )

}

export default LapTimes;