import '../styles/modalStyles.css';
import Help from './Help';
import helpData from './HelpData';

const AnalyzersAndSeries = ({ dimensions, columns, setDisplayPage, setShowModal, handleSubmit }) => {

    const columnGenerator = (n) => {
        let arr = [];
        for (let i = 0; i < n; i++) {
            arr.push(
                <div > <div className="boldText">{i === 0 ? "X-Axis" : "Y-Axis"} </div>
                    <select className={i} key={i}>
                        {columns.map(column => (
                            <option value={JSON.stringify(column)} key={column.header + column.filename}>{column.filename} - {column.header}</option>
                        ))}
                    </select>
                </div>);
        }
        return arr;
    }

    const analyzers = [
        { name: "None", code: null, parameters: [], checked: true },
        { name: "Linear Interpolate", code: "linearInterpolate", parameters: [] },
        { name: "Accel Curve", code: "accelCurve", parameters: [] },
        { name: "Rolling Average", code: "rollAvg", parameters: [{ name: "WindowSize", default: "100" }] },
        { name: "RDP Compression", code: "RDPCompression", parameters: [{ name: "Epsilon", default: "0.1" }] },
        { name: "sGolay", code: "sGolay", parameters: [{ name: "Window Size", default: "100" }, { name: "Polynomial Order", default: "3" }] },
        { name: "Split", code: "split", parameters: [{ name: "Start", default: "0" }, { name: "End", default: null }] },
        { name: "Linear Multiply", code: "linearMultiply", parameters: [{ name: "Multiplier", default: "1" }, { name: "Offset", default: "0" }] }
    ];

    const getAnalyzerOptions = () => {
        for (const inputElement of analyzers) {
            if (document.getElementById(inputElement.name).checked) {
                const params = inputElement.parameters.map(param => {
                    //console.log(paramId)
                    const value = document.getElementById(param.name).value;
                    return value === '' ? null : value;
                });
                //console.log(params);
                return params;
            }
        }
        return null;
    };

    var seriesInfo = []

    const addSeries = () => {

        var selectColumns = [];
        for (let i = 0; i < dimensions; i++) {
            selectColumns.push(JSON.parse(document.getElementsByClassName(i)[0].value));
        }

        seriesInfo.push({
            "columns": selectColumns,
            "analyze": {
                "analysis": analyzers.filter(analyzer => document.getElementById(analyzer.name).checked)[0].code,
                "analyzerValues": getAnalyzerOptions()
            }

        })
        console.log(seriesInfo)
    }

    return (
        <div className="colFlexBox">
            <h3>Select Axis</h3>
            <div className="rowFlexBox">
                {columnGenerator(dimensions)}
            </div>
            <div className="pushLeftFlexBox">
                <button onClick={addSeries}>Add Series</button>
            </div>
            <h3>Select Analyzers</h3>
            <div className="scrollColFlexBox">
                {Object.values(analyzers).map((analyzer) => {
                    return (

                        <div key={analyzer.name}>
                            <div className="rowFlexBox">
                                <input type="radio" id={analyzer.name} name="analyzerChoice" value="true" defaultChecked={analyzer.checked}></input>
                                <label htmlFor={analyzer.code}><div className="boldText">{analyzer.name}</div></label>
                                
                                {analyzer.parameters.length <= 0 ? null :
                                    <details>
                                        <summary></summary>
                                        <div className="scrollColFlexBox">
                                            <div className="rowFlexBox">
                                                {analyzer.parameters.map((param, index) => {
                                                    return (
                                                        <>
                                                            <label htmlFor={`param${index}`}>{`${param.name} ->`}</label>
                                                            <input type="number" id={param.name} className={`param${index}`} style={{ display: (analyzer.parameters.length >= 1) ? "block" : "none" }} defaultValue={param.default} />
                                                        </>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </details>
                                }
                                {analyzer.name === "None" ? <div className="info">
                                    <Help 
                                        popupText={
                                            helpData.none.title + '\n' + 
                                            helpData.none.description
                                        }
                                    />
                                </div> : null}

                                {analyzer.name === "Linear Interpolate" ? <div className="info">
                                    <Help 
                                        popupText={
                                            helpData.linearInterpolate.title + '\n' + 
                                            helpData.linearInterpolate.description
                                        }
                                        popupImg = {<img src="/linint_95x74.png" alt="Linear Interpolate Image"></img>} 
                                    />
                                </div> : null}

                                {analyzer.name === "Accel Curve" ? <div className="info">
                                    <Help 
                                        popupText={
                                            helpData.accelCurve.title + '\n' + 
                                            helpData.accelCurve.description
                                        }
                                    />
                                </div> : null}

                                {analyzer.name === "Rolling Average" ? <div className="info">
                                    <Help 
                                        popupText={
                                            helpData.rollAvg.title + '\n' + 
                                            helpData.rollAvg.description
                                        }
                                    />
                                </div> : null}

                                {analyzer.name === "RDP Compression" ? <div className="info">
                                    <Help 
                                        popupText={
                                            helpData.RDPCompression.title + '\n' + 
                                            helpData.RDPCompression.description
                                        }
                                    />
                                </div> : null}

                                {analyzer.name === "sGolay" ? <div className="info">
                                    <Help 
                                        popupText={
                                            helpData.sGolay.title + '\n' + 
                                            helpData.sGolay.description
                                        }
                                    />
                                </div> : null}

                                {analyzer.name === "Split" ? <div className="info">
                                    <Help 
                                        popupText={
                                            helpData.split.title + '\n' + 
                                            helpData.split.description
                                        }
                                    />
                                </div> : null}

                                {analyzer.name === "Linear Multiply" ? <div className="info">
                                    <Help 
                                        popupText={
                                            helpData.linearMultiply.title + '\n' + 
                                            helpData.linearMultiply.description
                                        }
                                    />
                                </div> : null}
                            </div>
                        </div>
                    )
                }
                )}
            </div>
            <div className="buttonFlexBox">
                <button className="submitbutton" onClick={() => {setDisplayPage(2)}}>Back</button>
                <button className="submitbutton" onClick={() => {addSeries(); handleSubmit(seriesInfo); setShowModal(false); }}>Submit</button>
            </div>
        </div>
    )

}

export default AnalyzersAndSeries