package backend.API.model;

public class fileList {

    public fileInformation[] files;

    public fileList(fileInformation[] files) {
        this.files = files;
    }

    public fileList() {
        this.files = new fileInformation[0];
    }

    public fileInformation[] getFiles() {
        return files;
    }

    public void setFiles(fileInformation[] files) {
        this.files = files;
    }

    public void addFile(fileInformation file) {
        fileInformation[] newFiles = new fileInformation[files.length + 1];
        for (int i = 0; i < files.length; i++) {
            newFiles[i] = files[i];
        }
        newFiles[files.length] = file;
        files = newFiles;
    }

    public String toString() {
        String fileList = "";
        for (int i = 0; i < files.length; i++) {
            fileList += files[i].toString() + "\n";
        }
        return fileList;
    }


    
}
