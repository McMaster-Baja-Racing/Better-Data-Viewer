import { AnalyzerType, FileInformation, FileTimespan, MinMax, RawFileInformation } from '@types';
import { isElectron } from './navigationUtils';
import { showErrorToast } from '@components/ui/toastNotification/ToastNotification';
import { extractUserMessage } from './errorUtils';

const baseApiUrl = 'http://' + (isElectron ? 'localhost' : window.location.hostname) + ':8080';

export const ApiUtil = {

  /**
    * Sends a GET request to the server to fetch a specific file.
    * @param {string} fileKey - The unique identifier of the file.
    * @returns {Promise<string>} A promise that resolves to the fetched file in the form of a string.
    */
  getFileAsText: async (fileKey: string) => {
    fileKey = encodeURIComponent(fileKey);
    const response = await fetch(`${baseApiUrl}/files/${fileKey}`);
    if (!response.ok) {
      const errorText = await response.text();
      const cleanMessage = extractUserMessage(errorText);
      throw Error(cleanMessage);
    }
    return response.text();
  },

  /**
    * Sends a GET request to the server to fetch a specific file.
    * @param {string} fileKey - The unique identifier of the file.
    * @returns {Promise<Blob>} A promise that resolves to the fetched file in the form of a Blob.
    */
  getFileAsBlob: async (fileKey: string) => {
    fileKey = encodeURIComponent(fileKey);
    const response = await fetch(`${baseApiUrl}/files/${fileKey}`);
    if (!response.ok) {
      const errorText = await response.text();
      const cleanMessage = extractUserMessage(errorText);
      throw Error(cleanMessage);
    }
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

    // Convert date strings to Date objects
    const rawFiles: RawFileInformation[] = await response.json();
    const files: FileInformation[] = rawFiles.map(file => ({
      ...file,
      date: new Date(file.date),
      start: new Date(file.start),
      end: new Date(file.end)
    }));

    return files;
  },

  /**
   * @description Sends a GET request to the server to fetch all bins that have been uploaded.
   * @returns {Promise<string[]>} A promise that resolves to an array of bin names.
   */
  getBins: async (): Promise<FileInformation[]> => {
    const response = await fetch(`${baseApiUrl}/files/listBins`);
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
    analyzerType: AnalyzerType | null,
    analyzerOptions: string[], // This one is weird as its dependent on which analyzer is run
  ): Promise<{ filename: string, text: string }> => {
    const params = new URLSearchParams();

    inputFiles.map(file => params.append('inputFiles', file));
    inputColumns.map(column => params.append('inputColumns', column));
    outputFiles?.map(file => params.append('outputFiles', file));
    if (analyzerType) params.append('type', analyzerType);
    analyzerOptions.map(option => params.append('analyzerOptions', option));

    const response = await fetch(`${baseApiUrl}/analyze?` + params.toString(), {
      method: 'POST'
    });

    if (!response.ok) {
      const errorText = await response.text();
      const cleanMessage = extractUserMessage(errorText);
      showErrorToast(`Code: ${response.status}\n${cleanMessage}`);
      throw Error(response.statusText);
    }

    const contentDisposition = response.headers.get('content-disposition');
    if (!contentDisposition) throw new Error('Content-Disposition header is missing'); 
    const filename = contentDisposition.split('filename=')[1].slice(1, -1);

    const text = await response.text();

    return { filename, text };
  },

  /**
   * @description Sends a POST request to the server to analyze files using smart detection.
   * Automatically detects which files contain the requested data types and selects appropriate analyzer.
   */
  analyzeFilesSmart: async (
    xDataType: string,
    yDataType: string,
    xSource: string,
    ySource: string,
    analyzerType: AnalyzerType | null,
    analyzerOptions: string[] = [],
  ): Promise<{ filename: string, text: string }> => {
    const params = new URLSearchParams();

    params.append('xDataType', xDataType);
    params.append('yDataType', yDataType);
    params.append('xSource', xSource);
    params.append('ySource', ySource);
    if (analyzerType) params.append('type', analyzerType);
    analyzerOptions.forEach(option => params.append('analyzerOptions', option));

    const response = await fetch(`${baseApiUrl}/analyze/smart?` + params.toString(), {
      method: 'POST'
    });

    if (!response.ok) {
      const errorText = await response.text();
      const cleanMessage = extractUserMessage(errorText);
      showErrorToast(`Code: ${response.status}\n${cleanMessage}`);
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
      const errorText = await response.text();
      const cleanMessage = extractUserMessage(errorText);
      showErrorToast(`Code: ${response.status}\n${cleanMessage}`);
      throw Error(response.statusText);
    }
    return response.json();
  },

  /**
     * @description Sends a DELETE request to the server to delete all files.
     */
  deleteAllFiles: async (): Promise<Response> => {
    const response = await fetch(`${baseApiUrl}/delete/all`, {
      method: 'DELETE' 
    });

    if (!response.ok) throw Error(response.statusText);

    return response;
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