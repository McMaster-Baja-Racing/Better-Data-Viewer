import '../styles/analyzersAndSeriesStyles.css';

const AnalyzersAndSeries = ({ dimensions, columns, setDisplayPage, setShowModal, handleSubmit, setDimensions, graphType}) => {

    const columnGenerator = (n) => {
        let arr = [];
        for (let i = 0; i < 2; i++) {
            arr.push(
                <div>
                    <div className="boldText">{i === 0 ? "X-Axis" : "Y Axis"} </div>
                    <select className={i} key={i} defaultValue={JSON.stringify(columns[i])}>
                        {columns.map(column => (
                            <option value={JSON.stringify(column)} key={column.header + column.filename}>{column.filename} - {column.header}</option>
                        ))}
                    </select>
                </div>);
        }
        let arr2 = [];
        if (n === 3) {
            arr2.push(
                <br></br>,
                <div>
                    <div className="boldText">Z Axis</div>
                    <select className={2} key={2} defaultValue={JSON.stringify(columns[2])}>
                        {columns.map(column => (
                            <option value={JSON.stringify(column)} key={column.header + column.filename}>{column.filename} - {column.header}</option>
                        ))}
                    </select>
                </div>);
        }
        return <div><div className='columnHeaders'>{arr}</div> <div className='columnHeaders2'>{arr2}</div></div>;
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
        <div className="analyzersAndSeriesContainer">
            <h3>Select Axis</h3>
         
                {graphType === "colour" ? (setDimensions(3)) : (setDimensions(2))}
                {columnGenerator(dimensions)}
         

            <h3>Select Analyzer</h3>
            <div className="analyzerContainer">
                {Object.values(analyzers).map((analyzer) => {
                    return (

                        <div className="analyzerBox" key={analyzer.name}>
                            <input type="radio" id={analyzer.name} name="analyzerChoice" value="true" defaultChecked={analyzer.checked}></input>
                            
                            {analyzer.parameters.length > 0 ? (
                                <details>
                                    <summary><strong>{analyzer.name}</strong></summary>
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
                                <label><strong>{analyzer.name}</strong></label>
                            )}
                            <br></br>
                        </div>
                    )
                }
                )}
            </div>
            <div className="buttonFlexBox">
                <button className="pageThreeBackButton" onClick={() => { setDisplayPage(2) }}>Back</button>
                <button className="addSeries" onClick={addSeries}>Add Series</button>
                <button className="pageThreeNextButton" onClick={() => { addSeries(); handleSubmit(seriesInfo); setShowModal(false); }}>Submit</button>
            </div>
        </div>
    )

}

export default AnalyzersAndSeries