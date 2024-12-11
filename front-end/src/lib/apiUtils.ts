import { AnalyzerType, FileInformation, FileTimespan, MinMax } from '@types';
import { baseApiUrl } from './electronUtils';

export const ApiUtil = {

  /**
    * Sends a GET request to the server to fetch a specific file.
    * @param {string} fileKey - The unique identifier of the file.
    * @returns {Promise<Blob>} A promise that resolves to the fetched file in the form of a Blob.
    */
  getFile: async (fileKey: string): Promise<Blob> => {
    fileKey = encodeURIComponent(fileKey);
    const response = await fetch(`${baseApiUrl}/files/${fileKey}`);
    if (!response.ok) throw Error(response.statusText);
    return response.blob();
  },

  /**
     * @description Fetches a list of files from the server. 
     * @returns {Promise<string[]>} A promise that resolves to an array of file names.
     */
  getFiles: async (): Promise<string[]> => {
    const response = await fetch(`${baseApiUrl}/files`);
    if (!response.ok) throw Error(response.statusText);

    return response.json();
  },

  /**
     * @description Sends a GET request to the server to fetch fileInformation about a specific folder.
     * @param {string} folderKey - The unique identifier of the folder.
     * @returns {Promise<FileInformation[]>} A promise that resolves to an array of fileInformation objects.
     */
  getFolder: async (folderKey: string): Promise<FileInformation[]> => {
    const response = await fetch(`${baseApiUrl}/files/information/folder/${folderKey}`);
    if (!response.ok) throw Error(response.statusText);
    return response.json();
  },

  /**
     * @description Sends a GET request to the server to fetch the timespans of a folder.
     * @param {string} folderKey - The unique identifier of the folder.
     * @returns {Promise<FileTimespan[]>} A promise that resolves to an array of FileTimespan objects.
     */
  getTimespans: async (folderKey: string): Promise<FileTimespan[]> => {
    const response = await fetch(`${baseApiUrl}/files/timespan/folder/${folderKey}`);
    if (!response.ok) throw Error(response.statusText);
    return response.json();
  },

  // TODO: Test this method
  /**
     * @description Sends a GET request to the server to analyze and return files.
     */
  analyzeFiles: async (
    inputFiles: string[],
    inputColumns: string[],
    outputFiles: string[] | null,
    type: AnalyzerType | null,
    analyzerOptions: string[], // This one is weird as its dependent on which analyzer is run
    live: boolean
  ): Promise<{ filename: string, text: string }> => {
    const params = new URLSearchParams();

    inputFiles.map(file => params.append('inputFiles', file));
    inputColumns.map(column => params.append('inputColumns', column));
    outputFiles?.map(file => params.append('outputFiles', file));
    if (type) params.append('type', type);
    analyzerOptions.map(option => params.append('analyzerOptions', option));
    if (live) params.append('live', live.toString());

    const response = await fetch(`${baseApiUrl}/analyze?` + params.toString(), {
      method: 'POST'
    });

    if (!response.ok) {
      alert(`An error has occured!\nCode: ${response.status}\n${await response.text()}`);
      throw Error(response.statusText);
    }

    const contentDisposition = response.headers.get('content-disposition');
    if (!contentDisposition) throw new Error('Content-Disposition header is missing'); 
    const filename = contentDisposition.split('filename=')[1].slice(1, -1);

    const text = await response.text();

    return { filename, text };
  },

  /**
     * @description Fetches the min and max values of a specific column in a file.
     * @returns {Promise<MinMax>} A promise that resolves to an object containing the min and max values of the column.
     */
  getMinMax: async (filename: string, header: string): Promise<MinMax> => {
    const url = `${baseApiUrl}/minMax/${encodeURIComponent(filename)}?column=${header}`;
    const response = await fetch(url);
        
    if (!response.ok) {
      alert(`An error has occured!\nCode: ${response.status}\n${await response.text()}`);
      throw Error(response.statusText);
    }
    return response.json();
  },

  /**
     * @description Sends a DELETE request to the server to delete all files.
     */
  deleteAllFiles: async (): Promise<void> => {
    const response = await fetch(`${baseApiUrl}/delete/all`, {
      // TODO: Why isn't this included?
      // method: "DELETE" 
    });

    if (!response.ok) throw Error(response.statusText);
  },

  /**
     * @description Sends a POST request to the server to start or stop live data.
     * @param {string} port - The port to be used for live data.
     * @returns {Promise<Boolean>} A promise that resolves to the updated state of live data.
     */
  toggleLiveData: async (port: string): Promise<boolean> => {
    const formData = new FormData();
    formData.append('port', port);

    // TODO: this method should use the form data
    const response = await fetch(`${baseApiUrl}/togglelive`, {
      method: 'PATCH',
      //body: formData,
    });

    if (!response.ok) throw Error(response.statusText);
    return response.json();
  },
    
  /**
     * @description Sends a POST request to the server to upload a file.
     */
  uploadFile: async (file: File): Promise<void> => {
    const formData = new FormData();
    formData.set('fileName', file.name);
    formData.set('fileData', file);

    const response = await fetch(`${baseApiUrl}/upload/file`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw Error(response.statusText);
  },
};