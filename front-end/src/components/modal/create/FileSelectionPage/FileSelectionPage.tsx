import  {useState, useEffect} from 'react';
import { ApiUtil } from '@lib/apiUtils';

/**
 * Allows the user to select a file from previously uploaded bins.
 * Note, this is only top-level files and not the individual data series within them.
 * @param handleNextPage Function called with the name of the selected file
 */
export const FileSelectionPage = ({ handleNextPage }: {handleNextPage: (file: string) => void}) => {
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [fileList, setFileList] = useState<string[]>([]);
  useEffect(()=>{
    ApiUtil.getFiles().then(list => {
      // This api function gets all files, we just want the folder names
      // TODO: do we want an API function for this?
      const binlist: string[] = [];
      for(const s of list)
      {
        const name = s.split('\\')[1];
        if(name && !binlist.includes(name)){
          binlist.push(name);
        }
      }
      setFileList(binlist);
      setSelectedFile(binlist[0]);
    });
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