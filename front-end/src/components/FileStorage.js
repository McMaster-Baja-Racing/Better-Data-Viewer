import 'font-awesome/css/font-awesome.min.css';
import '../styles/fileStorage.css'
import 'react-keyed-file-browser/dist/react-keyed-file-browser.css';
import FileBrowser, {Icons} from 'react-keyed-file-browser';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useState } from 'react'


// Here is a custom file renderer to be used in place of the default react-keyed-file-browser file renderer.
// This was done to give the "checked" property to the file element, which is used to allow the selection of multiple files at once.
const CustomFileRenderer = (props) => {
    const { selectedFiles, setSelectedFiles, browserProps } = props;
    console.log(props)

    // Get all information from props about the file
    const file = {
        key: props.fileKey,
        name: props.name.split('.')[0],
        size: props.size,
        modified: props.modified,
        extension: props.name.split('.').pop(),
        depth: props.depth,
    };

    // Either add or remove the file from the selectedFiles array
    const handleSelectFile = (e) => {
        console.log(file)
        const fileIndex = selectedFiles.findIndex((selectedFile) => selectedFile.key === file.key);

        if (fileIndex === -1) {
            // Add the file to the selectedFiles array if it's not already there
            console.log([...selectedFiles, file])
            setSelectedFiles([...selectedFiles, file]);
        } else {
            // Remove the file from the selectedFiles array if it's already there
            console.log(selectedFiles.filter((_, index) => index !== fileIndex))
            setSelectedFiles(selectedFiles.filter((_, index) => index !== fileIndex));
        }
    };

    // Check if the file is in the selectedFiles array
    const isSelected = selectedFiles.some((selectedFile) => selectedFile.key === file.key);

    // Default padding values
    const paddingLeft = 16; // This is the base padding value in pixels.
    const depthPadding = paddingLeft * file.depth + 12;

    // Idk what this is for but it might be important?
    const { connectDragSource, connectDropTarget } = browserProps;

    // Check if size is in the range of MB or KB and return the appropriate string
    const formatSize = (size) => {
        if (size > 1024 * 1024) {
            return `${Math.round(size / (1024 * 1024 ))} MB`;
        }

        if (size > 1024) {
            return `${Math.round(size / 1024)} KB`;
        }

        return `${size} B`;
    };

    return (
        // Add in table row and then table data for each file, default styling will space it properly
        <tr {...connectDragSource} {...connectDropTarget} className={`file ${isSelected ? 'selected' : ''}`} onClick={handleSelectFile} >
            <td className="name" style={{ paddingLeft: depthPadding }}>{file.name}</td>
            <td className="size">{formatSize(file.size)}</td>
            <td className="modified">{file.modified ? file.modified : "-"}</td>
        </tr>
        
    );
};
 
const FileStorage = ({ files, selectedFiles, setSelectedFiles }) => {
    // Files is of format [{key: "name", fileHeaders: [header1, header2], size: 1234}, ...}]

    // Here is the implementation of the file browser with props passed in
    return (
        <div >
            <div className="file-browser">
                <h3>Choose Files</h3>
                <FileBrowser
                    files={files}
                    icons={Icons.FontAwesome(4)}
                    fileRendererProps={{ selectedFiles, setSelectedFiles }}
                    fileRenderer={CustomFileRenderer}
                />
            </div>
        </div>
    )
}

export default FileStorage