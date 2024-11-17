import React from 'react';
import './SubteamPresets.css';

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
    const handleTypeSelect = (e) => {
        if (e.target.value === 'video') {
            (
                document.getElementById('liveDataCheckbox') as HTMLInputElement
            ).checked = false;
            (
                document.getElementById('liveDataCheckbox') as HTMLInputElement
            ).disabled = true;
        } else {
            (
                document.getElementById('liveDataCheckbox') as HTMLInputElement
            ).disabled = false;
        }
    };

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

            {Preset({title: "Shift Curve", description: "Primary RPM vs secondary RPM"})}
            {Preset({title: "Speed", description: "GPS speed over time"})}
            {Preset({title: "Primary RPM", description: "Primary RPM over time smoothed with Savitzky-Golay filter"})}
            {Preset({title: "Secondary RPM", description: "Secondary RPM over time smoothed with Savitzky-Golay filter"})}
            {Preset({title: "Suspension Travel", description: "All four suspension travel graphs over time"})}

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
