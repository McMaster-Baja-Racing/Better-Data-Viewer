import React from 'react';
import './SubteamPresets.css';
import { subteamGraphPresets } from '@lib/subteamGraphPresets';
import { DataViewerPreset, GraphPreset } from '@types';
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
    )
};

const SubteamPresets = ({ movePage, setGraphType, setLiveCheck, video }) => {

    const handleNextPage = () => {
        setGraphType(
            (document.getElementById('graphTypeSelect') as HTMLInputElement)
                .value
        );
        setLiveCheck(
            (document.getElementById('liveDataCheckbox') as HTMLInputElement)
                .checked
        );
        const moveToVideoSelect =
            (document.getElementById('graphTypeSelect') as HTMLInputElement)
                .value === 'video' && video.key === '';
        movePage(moveToVideoSelect ? 1 : 2);
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
