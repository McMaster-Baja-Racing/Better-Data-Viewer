import React, { useState } from 'react';
import './PresetSelectionPage.css';
import { subteamGraphPresets } from '@lib/subteamGraphPresets';
import { DataViewerPreset } from '@types';
const Preset = ({
  title,
  description,
  selected,
  clickCallback
}: {
    title: string;
    description: string;
    selected: boolean;
    clickCallback: () => void;
}) => {
  return (
    <div className={`presets-preset ${selected ? 'presets-preset--selected' : ''}`} onClick={clickCallback}>
      <p className="presets-preset-title">{title}</p>
      <p className="presets-preset-description">{description}</p>
    </div>
  );
};


const PresetSelectionPage = ({ handleNextPage }: {handleNextPage: (preset: DataViewerPreset) => void}) => {
  const [selectedPreset, setSelectedPreset] = useState(0);

  return (
    <div className="presets-container">
      <div className="presets-instructions">
        <h3>Choose a graph preset</h3>
      </div>

      {subteamGraphPresets.map((preset: DataViewerPreset, index: number) => (
        Preset({title: preset.name,
          description: preset.description,
          selected: index == selectedPreset,
          clickCallback: () => setSelectedPreset(index)})
      ))}

      <button
        className="PageButton"
        onClick={() => {
          handleNextPage(subteamGraphPresets[selectedPreset]);
        }}
      >
                Next
      </button>
    </div>
  );
};

export default PresetSelectionPage;
