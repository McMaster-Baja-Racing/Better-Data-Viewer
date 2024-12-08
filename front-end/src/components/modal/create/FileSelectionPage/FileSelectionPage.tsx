import  {useState, useEffect} from 'react';
import { ApiUtil } from '@lib/apiUtils';

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
          console.log("Here the file is: " + selectedFile);
          handleNextPage(selectedFile);
        }}
      >
            Next
      </button>
    </>
  );
};