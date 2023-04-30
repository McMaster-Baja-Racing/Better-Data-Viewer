import '../styles/fileStorage.css'
import 'react-keyed-file-browser/dist/react-keyed-file-browser.css';
import FileBrowser, {Icons} from 'react-keyed-file-browser';
import { useState } from 'react'

const CustomFileRenderer = (props) => {
    const { isSelected, onClick, browserProps } = props;
    const file = {
        key: props.fileKey,
        name: props.name,
        size: props.size,
        modified: props.modified,
        extension: props.name.split('.').pop(),
    };

    console.log(props)

    const { connectDragSource, connectDropTarget } = browserProps;

    return (
        // ${isSelected ? 'selected' : ''}
        <tr {...connectDragSource} {...connectDropTarget} className={`file`} onClick={onClick}>
            <td className="name">{file.name}</td>
            <td className="size">{file.size / (1024 * 1024) + " MB"}</td>
            <td className="modified">{file.modified ? file.modified : "-"}</td>
        </tr>
    );
};

const FileStorage = () => {

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

    const [selectedFiles, setSelectedFiles] = useState([]);

    const handleSelectFile = (file) => {
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

    return (
        <div>
            <h1>File Storage</h1>
            <div className="file-browser">
                <h3>Choose Files</h3>
                <FileBrowser
                    files={browseFiles}
                    icons={Icons.FontAwesome(4)}

                    // fileRendererProps={{ handleSelectFile }}
                    fileRenderer={CustomFileRenderer}
                />
            </div>
        </div>
    )
}

export default FileStorage