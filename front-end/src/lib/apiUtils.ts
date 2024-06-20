import { AnalyzerType } from '../types/AnalyzerData';

export const ApiUtil = {

  /**
     * @description Sends a GET request to the server to fetch a specific file.
     * @param {string} fileKey - The unique identifier of the file.
     * @returns {Promise<Response>} A promise that resolves to the server's response.
     */
  getFile: async (fileKey: string) => {
    fileKey = encodeURIComponent(fileKey);
    const response = await fetch(`http://${window.location.hostname}:8080/files/${fileKey}`);
    if (!response.ok) throw Error(response.statusText);
    return response;
  },

  /**
     * @description Fetches a list of files from the server. 
     * Each file in the list is represented as an object with the following properties:
     * - key: A  that represents the unique identifier of the file.
     * - fileHeaders: An array of strings that represents the headers of the file.
     * - size: A long that represents the size of the file.
     * @returns {Promise<Array<Object>>} A promise that resolves to an array of file objects.
     */
  getFiles: async () => {
    const response = await fetch(`http://${window.location.hostname}:8080/files`);
    if (!response.ok) throw Error(response.statusText);

    return response;
  },

  /**
     * @description Sends a GET request to the server to fetch fileInformation about a specific folder.
     * Each file in the list is represented as an object with the following properties:
     * - key: A  that represents the unique identifier of the file. This will be relative to the folder provided.
     * - fileHeaders: An array of strings that represents the headers of the file.
     * - size: A long that represents the size of the file.
     * 
     * @param {string} folderKey - The unique identifier of the folder.
     * @returns {Promise<Response>} A promise that resolves to the server's response.
     */
  getFolder: async (folderKey: string) => {
    const response = await fetch(`http://${window.location.hostname}:8080/files/information/folder/${folderKey}`);
    if (!response.ok) throw Error(response.statusText);
    return response;
  },

  /**
     * @description Sends a GET request to the server to fetch the timespans of a folder.
     * @param {string} folderKey - The unique identifier of the folder.
     * @returns {Promise<Response>} A promise that resolves to the server's response.
     */
  getTimespans: async (folderKey: string) => {
    const response = await fetch(`http://${window.location.hostname}:8080//files/timespan/folder/${folderKey}`);
    if (!response.ok) throw Error(response.statusText);
    return response;
  },

  /**
     * @description Sends a GET request to the server to analyze and return files.
     * @param {string} inputFiles - The input files.
     * @param {string} inputColumns - The input columns.
     * @param {string} outputFiles - The output files.
     * @param {AnalyzerType} type - The analyzer type.
     * @param {string} analyzerOptions - The analyzer options.
     * @param {Boolean} live - The live options.
     * @returns {Promise<Response>} A promise that resolves to the server's response.
     */
  analyzeFiles: async (
    inputFiles: string,
    inputColumns: string,
    outputFiles: string,
    type: AnalyzerType,
    analyzerOptions: string,
    live: boolean
  ) => {
    try {
      const params = new URLSearchParams();
      const parameters = { inputFiles, inputColumns, outputFiles, type, analyzerOptions, live };

      Object.entries(parameters).forEach(([key, value]) => {
        if (value && (typeof value === 'string' && value.length !== 0)) {
          if (Array.isArray(value)) {
            value.forEach((val) => {
              params.append(key, val);
            });
          } else {
            params.append(key, value);
          }
        }
      });

      const response = await fetch(`http://${window.location.hostname}:8080/analyze?` + params.toString(), {
        method: 'POST'
      });

      if (!response.ok) {
        alert(`An error has occured!\nCode: ${response.status}\n${await response.text()}`);
        throw Error(response.statusText);
      }
      return response;
    } catch (error) {
      console.log('Analyzer Error:', error);
    }
  },

  /**
     * @description Fetches the min and max values of a specific column in a file.
     * @param {string} filename - The name of the file.
     * @param {string} header - The name of the column.
     * @returns {Promise<Response>} A promise that resolves to the server's response.
     */
  getMinMax: async (filename: string, header: string) => {
    const url = `http://${window.location.hostname}:8080/minMax/${encodeURIComponent(filename)}?column=${header}`;
    const response = await fetch(url);
        
    if (!response.ok) {
      alert(`An error has occured!\nCode: ${response.status}\n${await response.text()}`);
      throw Error(response.statusText);
    }
    return response;
  },

  /**
     * @description Sends a DELETE request to the server to delete all files.
     * @returns {Promise<Response>} A promise that resolves to the server's response.
     */
  deleteAllFiles: async () => {
    const response = await fetch(`http://${window.location.hostname}:8080/delete/all`, {
      // method: "DELETE"
    });

    if (!response.ok) throw Error(response.statusText);
    return response;
  },

  /**
     * @description Sends a POST request to the server to start or stop live data.
     * @param {string} port - The port to be used for live data.
     * @returns {Promise<Response>} A promise that resolves to the server's response.
     */
  toggleLiveData: async (port: string) => {
    const formData = new FormData();
    formData.append('port', port);

    const response = await fetch(`http://${window.location.hostname}:8080/togglelive`, {
      method: 'PATCH',
      //body: formData,
    });

    if (!response.ok) throw Error(response.statusText);
    return response;
  },
    
  /**
     * @description Sends a POST request to the server to upload a file.
     * @param {File} file - The file to be uploaded.
     * @returns {Promise<Response>} A promise that resolves to the server's response.
     */
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.set('fileName', file.name);
    formData.set('fileData', file);

    const response = await fetch(`http://${window.location.hostname}:8080/upload/file`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) throw Error(response.statusText);
    return response;
  },

};