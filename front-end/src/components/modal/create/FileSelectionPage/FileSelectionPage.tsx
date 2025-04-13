import  {useState, useEffect} from 'react';
import { ApiUtil } from '@lib/apiUtils';

/**
 * Allows the user to select a file from previously uploaded bins.
 * Note, this is only top-level files and not the individual data series within them.
 */
export const FileSelectionPage = ({ handleNextPage }: {handleNextPage: (file: string) => void}) => {
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [fileList, setFileList] = useState<string[]>([]);
  useEffect(()=>{
    ApiUtil.getBins().then(list => {
      const newList = list.map((file) => file.key);
      setFileList(newList);
      setSelectedFile(newList[0]);
    })
  }, []);
  return (
    <>
      <h3>Choose a file to analyze</h3>
      <select name="files" onChange={event => setSelectedFile(event.target.value)}>
        {fileList.map((filename, index) => (<option id={`${index}`} key={filename}>{filename}</option>))}
      </select>

      <button
        className="PageButton"
        onClick={() => {
          handleNextPage(selectedFile);
        }}
      >
            Next
      </button>
    </>
  );
};