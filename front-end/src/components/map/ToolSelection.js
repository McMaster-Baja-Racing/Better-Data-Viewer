import React from 'react';

const ToolSelection = ({ options, selected, setSelected }) => {

  function handleClick(index) {
    setSelected(index);
  }
  return (
    <span>
      {options.map((elem, index) => (
        <button
          key={elem}
          className={'map_ui_tool map_ui_button ' + (selected === index ? 'selected' : '')}
          onClick={() => handleClick(index)}
        >
          {elem}
        </button>
      ))}
    </span>
  );
};

export default ToolSelection;