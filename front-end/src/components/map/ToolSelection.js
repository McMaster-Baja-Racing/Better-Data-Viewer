import { useState } from "react";

const ToolSelection = ({ options, onChange }) => {
    const [selected, setSelected] = useState(0);

    function handleClick(index) {
        setSelected(index);
        onChange(index);
    }
    return (
        <span>
            {options.map((elem, index) => <button key={elem} className={'map_ui_tool map_ui_button ' + (selected === index ? 'selected' : '')} onClick={() => handleClick(index)}> {elem} </button>)}
        </span>
    )
}

export default ToolSelection;