import 'font-awesome/css/font-awesome.min.css';
import '../../styles/fileStorage.css'
import 'react-keyed-file-browser/dist/react-keyed-file-browser.css';
import RawFileBrowser, { Icons } from 'react-keyed-file-browser';
import { useState, useEffect } from 'react';

const formatSize = (size) => {
    // Finds the order of magnitude of the size in base 1024 (e.g. how many digits it would have)
    const magnitude = Math.floor(Math.log(size) / Math.log(1024));
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'ZB', 'YB', 'RB', 'QB'];
    // Uses order of magnitude to get units and calculate value
    return `${Math.round(size / (1024 ** magnitude))} ${units[magnitude]}`
};

// Here is a custom file renderer to be used in place of the default react-keyed-file-browser file renderer.
// This was done to give the "checked" property to the file element, which is used to allow the selection of multiple files at once.
const CustomFileRenderer = (props) => {
    const { files, selectedFiles, setSelectedFiles, browserProps } = props;

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
        const fileIndex = selectedFiles.findIndex((selectedFile) => selectedFile.key === file.key);

        if (fileIndex === -1) {
            // Instead of adding file, add the file that corresponds to the key from the files list
            setSelectedFiles([...selectedFiles, files.find((file) => file.key === props.fileKey)]);
        } else {
            // Remove the file from the selectedFiles array if it's already there
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
    
    // If there's a slash in the file's path, use the folder it's in as the date modified
    let pathArr = file.key.split('/')
    if (pathArr.length > 1) {
        file.modified = pathArr[pathArr.length - 2];
    }

    return (
        // Add in table row and then table data for each file, default styling will space it properly
        <tr {...connectDragSource} {...connectDropTarget} className={`file ${isSelected ? 'selected' : ''}`} onClick={handleSelectFile} >
            <td className="name" style={{ paddingLeft: depthPadding }}>{file.name}</td>
            <td className="size">{formatSize(file.size)}</td>
            <td className="modified">{file.modified ? file.modified : "-"}</td>
        </tr>

    );
};

const CustomFolderRenderer = (props) => {
    const { isOpen, browserProps, children } = props;
    const { connectDragSource, connectDropTarget } = browserProps;

    // Calculates folder size by going through all the files and adding those in the folder to a total
    const folderSize = children.reduce((total, file) => total + file.size, 0);

    const handleFolderClick = (e) => {
        browserProps.toggleFolder(props.fileKey);
    }

    const paddingLeft = 16; // This is the base padding value in pixels.
    const depthPadding = paddingLeft * props.depth + 12;

    return (
        <tr {...connectDragSource} {...connectDropTarget} className={`folder ${isOpen ? 'open' : ''}`} onClick={handleFolderClick}>
            <td className="name" style={{ paddingLeft: depthPadding }}><i className={`${isOpen ? "fa fa-folder-open-o" : "fa fa-folder-o"}`} aria-hidden="true"/>{props.name}</td>
            <td className="size">{formatSize(folderSize)}</td>
            <td className="modified">-</td>
        </tr>
    );

}


const FileStorage = ({ selectedFiles, setSelectedFiles }) => {
    // Files is of format [{key: "name", fileHeaders: [header1, header2], size: 1234}, ...}]
    // Here is the implementation of the file browser with props passed in
    
    // holds all the files which have been uploaded
    const [files, setFiles] = useState([])

    useEffect(() => {
        // Fetch data when the component mounts
        fetch(`http://${window.location.hostname}:8080/files`)
          .then((response) => response.json())
          .then((data) => {
            setFiles(data.files);
          });
      }, []); // Empty dependency array ensures that the fetch is only performed once

    return (
        <RawFileBrowser
            files={files}
            icons={Icons.FontAwesome(4)}
            fileRendererProps={{ files, selectedFiles, setSelectedFiles }}
            fileRenderer={CustomFileRenderer}
            folderRenderer={CustomFolderRenderer}
        />
    )
}

export default FileStorage