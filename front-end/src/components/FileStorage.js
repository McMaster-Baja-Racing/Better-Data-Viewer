import 'font-awesome/css/font-awesome.min.css';
import '../styles/fileStorage.css'
import 'react-keyed-file-browser/dist/react-keyed-file-browser.css';
import FileBrowser, {Icons} from 'react-keyed-file-browser';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useState } from 'react'

const CustomFileRenderer = (props) => {
    const { selectedFiles, setSelectedFiles, browserProps } = props;

    const file = {
        key: props.fileKey,
        name: props.name,
        size: props.size,
        modified: props.modified,
        extension: props.name.split('.').pop(),
        depth: props.depth,
    };

    //console.log(props)
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

    const isSelected = selectedFiles.some((selectedFile) => selectedFile.key === file.key);

    const paddingLeft = 16; // This is the base padding value in pixels.
    const depthPadding = paddingLeft * file.depth + 12;

    const { connectDragSource, connectDropTarget } = browserProps;

    return (
        // ${isSelected ? 'selected' : ''}
        <tr {...connectDragSource} {...connectDropTarget} className={`file ${isSelected ? 'selected' : ''}`} onClick={handleSelectFile}>
            <td className="name" style={{ paddingLeft: depthPadding }}>{file.name}</td>
            <td className="size">{file.size / (1024 * 1024) + " MB"}</td>
            <td className="modified">{file.modified ? file.modified : "-"}</td>
        </tr>
        
    );
};
 
const FileStorage = ({ files, selectedFiles, setSelectedFiles }) => {

    const [browseFiles, setBrowseFiles] = useState([
        {
            key: 'cat.png',
            size: 1.5 * 1024 * 1024,
        },
        {
            key: 'dog.png',
            size: 2 * 1024 * 1024,
        },
        {
            key: 'animal/elephant.png',
            size: 3 * 1024 * 1024,

        }
    ])

    //const [selectedFiles, setSelectedFiles] = useState([]);

    return (
        <div>
            <h1>File Storage</h1>
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