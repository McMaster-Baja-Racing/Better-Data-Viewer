import React from 'react';
import './SubteamPresets.css';
import { subteamGraphPresets } from '@lib/subteamGraphPresets';
import { DataViewerPreset } from '@types';
const Preset = ({
  title,
  description,
}: {
    title: string;
    description: string;
}) => {
  return (
    <div className="presets-preset">
      <p className="presets-preset-title">{title}</p>
      <p className="presets-preset-description">{description}</p>
    </div>
  );
};

const SubteamPresets = ({ movePage }) => {

  const handleNextPage = () => {
    movePage(1);
  };

  return (
    <div className="presets-container">
      <div className="presets-instructions">
        <h1>Welcome to the Simpler Data Viewer!</h1>
        <h3>Instructions</h3>
        <ol>
          <li>Select the graph you want to make.</li>
          <li>Select the files you want to graph.</li>
        </ol>
      </div>

      {subteamGraphPresets.map((preset: DataViewerPreset) => (
        Preset({title: preset.name, description: preset.description})
      ))}

      <button
        className="PageButton"
        onClick={() => {
          handleNextPage();
        }}
      >
                Next
      </button>
    </div>
  );
};

export default SubteamPresets;
