
export const ApiUtil = {

    /**
     * @description Sends a GET request to the server to fetch a specific file.
     * @param {string} fileKey - The unique identifier of the file.
     * @returns {Promise<Response>} A promise that resolves to the server's response.
     */
    getFile: async (fileKey) => {
        const response = await fetch(`http://${window.location.hostname}:8080/files/${fileKey}`);
        if (!response.ok) throw Error(response.statusText);
        return response;
    },

    /**
     * @description Fetches a list of files from the server. Each file in the list is represented as an object with the following properties:
     * - key: A  that represents the unique identifier of the file.
     * - fileHeaders: An array of strings that represents the headers of the file.
     * - size: A long that represents the size of the file.
     * @returns {Promise<Array<Object>} A promise that resolves to an array of file objects.
     */
    getFiles: async () => {
        const response = await fetch(`http://${window.location.hostname}:8080/files`);
        if (!response.ok) throw Error(response.statusText);

        return response;
    },

    /**
     * @description Sends a GET request to the server to fetch a specific folder.
     * @param {string} folderKey - The unique identifier of the folder.
     * @returns {Promise<Response>} A promise that resolves to the server's response.
     */
        getFolder: async (folderKey) => {
            const response = await fetch(`http://${window.location.hostname}:8080/files/folder/${folderKey}`);
            if (!response.ok) throw Error(response.statusText);
            return response;
        },

    /**
     * @description Sends a GET request to the server to fetch the timespans of a folder.
     * @param {string} folderKey - The unique identifier of the folder.
     * @returns {Promise<Response>} A promise that resolves to the server's response.
     */
        getTimespans: async (folderKey) => {
            const response = await fetch(`http://${window.location.hostname}:8080/timespan/folder/${folderKey}`);
            if (!response.ok) throw Error(response.statusText);
            return response;
        },

    /**
     * @description Sends a GET request to the server to analyze and return files.
     * @param {string} inputFiles - The input files.
     * @param {string} inputColumns - The input columns.
     * @param {string} outputFiles - The output files.
     * @param {string} analyzerOptions - The analyzer options.
     * @param {string} liveOptions - The live options.
     * @returns {Promise<Response>} A promise that resolves to the server's response.
     */
    analyzeFiles: async (inputFiles, inputColumns, outputFiles, analyzerOptions, liveOptions) => {
        try {
            const response =  await fetch(`http://${window.location.hostname}:8080/analyze?` + new URLSearchParams({
                inputFiles: inputFiles,
                inputColumns: inputColumns,
                outputFiles: outputFiles,
                analyzer: analyzerOptions,
                liveOptions: liveOptions
            }));
            if (!response.ok) {
                alert(`An error has occured!\nCode: ${response.status}\n${await response.text()}`);
                throw Error(response.statusText);
            }
            return response;
        } catch (error) {
            console.log("Analyzer Error:", error)
        }
    },

    /**
     * @description Sends a GET request to the server to fetch the minimum and maximum values of a specific column in a file.
     * @param {string} filename - The name of the file.
     * @param {string} header - The name of the column.
     * @returns {Promise<Response>} A promise that resolves to the server's response.
     */
    getMinMax: async (filename, header) => {
        const response = await fetch(`http://${window.location.hostname}:8080/files/maxmin/${filename}?headerName=${header}`);
        
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
        const response = await fetch(`http://${window.location.hostname}:8080/deleteAll`, {
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
    toggleLiveData: async (port) => {
        const formData = new FormData();
        formData.append('port', port);

        const response = await fetch(`http://${window.location.hostname}:8080/live`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) throw Error(response.statusText);
        return response;
    },
    
    /**
     * @description Sends a POST request to the server to upload a file.
     * @param {FormData} file - The file to be uploaded.
     * @returns {Promise<Response>} A promise that resolves to the server's response.
     */
    uploadFile: async (file) => {
        const formData = new FormData();
        formData.set("file", file);

        const response = await fetch(`http://${window.location.hostname}:8080/upload`, {
            method: "POST",
            body: formData,
        });

        if (!response.ok) throw Error(response.statusText);
        return response;
    },

}