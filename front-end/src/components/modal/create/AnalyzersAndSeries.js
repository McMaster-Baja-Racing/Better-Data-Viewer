import '../../../styles/modalStyles.css';
import Help from './Help';
import analyzerData from '../../analyzerData';
import '../../../styles/analyzersAndSeriesStyles.css';
import { useState, useRef } from 'react';
const AnalyzersAndSeries = ({ dimensions, columns, setDisplayPage, setShowModal, handleSubmit, setSuccessMessage }) => {

    const columnGenerator = (n) => {
        let arr = [];
        for (let i = 0; i < n; i++) {
            arr.push(
                <div >
                    <div className="boldText">{i === 0 ? "X-Axis" : "Y-Axis"} </div>
                    <select className={i} key={i}>
                        {columns.map(column => (
                            <option value={JSON.stringify(column)} key={column.header + column.filename}>{column.filename} - {column.header}</option>
                        ))}
                    </select>
                </div>);
        }
        return arr;
    }

    var seriesInfo = useRef([]);
    

    const addSeries = (isSeries) => {

        if (isSeries) {
            setSuccessMessage({ message: "Series Added" });
        } else {
            setSuccessMessage({ message: "Graph Created" });
        }

        var selectColumns = [];
        for (let i = 0; i < dimensions; i++) {
            selectColumns.push(JSON.parse(document.getElementsByClassName(i)[0].value));
        }

        var checkedAnalyzer = analyzerData.filter(analyzer => document.getElementById(analyzer.title).checked)[0]

        seriesInfo.current.push({
            "columns": selectColumns,
            "analyze": {
                "analysis": checkedAnalyzer.code,
                "analyzerValues": checkedAnalyzer.parameters.map(param => {
                    const value = document.getElementById(param.name).value;
                    return value === '' ? null : value;
                })
            }
        })
        console.log(seriesInfo)
    }

    const [openPopup, setOpenPopup] = useState(null);

    return (
        <div className="analyzersAndSeriesContainer">
            <h3>Select Axis</h3>
            <div className="columnHeaders">
                {columnGenerator(dimensions)}
            </div>

            <h3>Select Analyzer</h3>
            <div className="analyzerContainer">
                {analyzerData.map((analyzer) => {
                    //console.log(analyzer)
                    return (

                        <div className="analyzerBox" key={analyzer.title}>
                            <input type="radio" id={analyzer.title} name="analyzerChoice" value="true" defaultChecked={analyzer.checked}/>
                            
                            {analyzer.parameters.length > 0 ? (
                                <details>
                                    <summary><strong>{analyzer.title}</strong></summary>
                                        {analyzer.parameters.map((param, index) => {
                                            return (
                                                <div className="parambox">
                                                    <label htmlFor={`param${index}`}>{`${param.name} ->`}</label>
                                                    <input type="number" id={param.name} className={`param${index}`} defaultValue={param.default} />
                                                </div>
                                            
                                            )
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
                    )
                }
                )}
            </div>
            <div className="buttonFlexBox">
                <button className="pageThreeBackButton" onClick={() => { setDisplayPage(2) }}>Back</button>
                <button className="addSeries" onClick={() => {addSeries(true); }}>Add Series</button>
                <button className="pageThreeNextButton" onClick={() => {addSeries(false); handleSubmit(seriesInfo.current); setShowModal(''); }}>Submit</button>
            </div>
        </div>
    )

}

export default AnalyzersAndSeries