import React, { useState } from 'react';
import './PresetSelectionPage.css';
import { subteamGraphPresets } from '@lib/subteamGraphPresets';
import { DataViewerPreset } from '@types';
/**
 * Creates a clickable card with a title and description
 * @param title Title of the card
 * @param description Description of the card
 * @param selected Whether this card is currently selected
 * @param clickCallback Function to call when this card is clicked
 * @returns 
 */
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

/**
 * Page to allow the user to choose an analysis preset from a list
 * @param handleNextPage Function to be called with the DataViewerPreset the user selected 
 */
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
