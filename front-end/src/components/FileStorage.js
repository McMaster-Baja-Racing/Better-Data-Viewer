import 'font-awesome/css/font-awesome.min.css';
import '../styles/fileStorage.css'
import 'react-keyed-file-browser/dist/react-keyed-file-browser.css';
import RawFileBrowser, { Icons } from 'react-keyed-file-browser';

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


const FileStorage = ({ files, selectedFiles, setSelectedFiles, setColumns, setDisplayPage}) => {
    // Files is of format [{key: "name", fileHeaders: [header1, header2], size: 1234}, ...}]
    // Here is the implementation of the file browser with props passed in

    // This method will return headers when supplied with a list of files. Added support for folders is neccesary
    const getHeaders = async (files) => {
      var col = [];
  
      files.forEach(file => {
        file.fileHeaders.forEach(header => {
          col.push({
            "header": header,
            "filename": file.key
          })
        })
      })
  
      setColumns(col);
    }

    return (
        <div className='file-Storage-Container'>
            <div className="file-browser">
                <h3>Choose Files</h3>
                <RawFileBrowser
                    files={files}
                    icons={Icons.FontAwesome(4)}
                    fileRendererProps={{ selectedFiles, setSelectedFiles }}
                    fileRenderer={CustomFileRenderer}
                    folderRendererProps={{files}}
                    folderRenderer={CustomFolderRenderer}
                />
            </div>
            <div className="fileButtons">
                <button className="pageTwoBackButton" onClick={() => {setDisplayPage(1)}}>Back</button>
                <button className="pageTwoNextButton" onClick={() => {
                // OnClick, it should get the selected files from the file storage component
                if (selectedFiles.length === 0) {
                    alert("Please select at least one file.");
                    return;
                }
                getHeaders(selectedFiles)
                setDisplayPage(3);
                }} >Next</button>
            </div>
        </div>
    )
}

export default FileStorage