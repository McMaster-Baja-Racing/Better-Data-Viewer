import 'font-awesome/css/font-awesome.min.css';
import '../styles/fileStorage.css'
import 'react-keyed-file-browser/dist/react-keyed-file-browser.css';
import RawFileBrowser, { Icons } from 'react-keyed-file-browser';

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

    // Check if size is in the range of MB or KB and return the appropriate string
    const formatSize = (size) => {
        if (size > 1024 * 1024) {
            return `${Math.round(size / (1024 * 1024))} MB`;
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

const CustomFolderRenderer = (props) => {
    const { isOpen, browserProps } = props;
    const { connectDragSource, connectDropTarget } = browserProps;

    const handleFolderClick = (e) => {
        browserProps.toggleFolder(props.fileKey);
    }

    const paddingLeft = 16; // This is the base padding value in pixels.
    const depthPadding = paddingLeft * props.depth + 12;

    return (
        <tr {...connectDragSource} {...connectDropTarget} className={`folder ${isOpen ? 'open' : ''}`} onClick={handleFolderClick}>
            <td className="name" style={{ paddingLeft: depthPadding }}><i className={`${isOpen ? "fa fa-folder-open-o" : "fa fa-folder-o"}`} aria-hidden="true"/>{props.name}</td>
            <td className="size">-</td>
            <td className="modified">-</td>
        </tr>
    );

}


const FileStorage = ({ files, selectedFiles, setSelectedFiles, setDimensions, setColumns, setDisplayPage}) => {
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
        <div>
            <div className="file-browser">
                <h3>Choose Files</h3>
                <RawFileBrowser
                    files={files}
                    icons={Icons.FontAwesome(4)}
                    fileRendererProps={{ files, selectedFiles, setSelectedFiles }}
                    fileRenderer={CustomFileRenderer}
                    folderRenderer={CustomFolderRenderer}
                />
            </div>
            <div className="buttonFlexBox">
        <button className="submitbutton" onClick={() => {setDisplayPage(1)}}>Back</button>
        <button className="submitbutton" onClick={() => {
          // OnClick, it should get the selected files from the file storage component
          if (selectedFiles.length === 0) {
            alert("Please select at least one file.");
            return;
          }
          console.log("selected files")
          console.log(selectedFiles)
          getHeaders(selectedFiles)
          setDimensions(2)
          setDisplayPage(3);
        }} >Next</button>
      </div>
        </div>
    )
}

export default FileStorage