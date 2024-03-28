package backend.API.model;

public class FileList {

  public FileInformation[] files;

  public FileList(FileInformation[] files) {
    this.files = files;
  }

  public FileList() {
    this.files = new FileInformation[0];
  }

  public FileInformation[] getFiles() {
    return files;
  }

  public void setFiles(FileInformation[] files) {
    this.files = files;
  }

  public void addFile(FileInformation file) {
    FileInformation[] newFiles = new FileInformation[files.length + 1];
    System.arraycopy(files, 0, newFiles, 0, files.length);
    newFiles[files.length] = file;
    files = newFiles;
  }

  public String toString() {
    StringBuilder fileList = new StringBuilder();
    for (FileInformation file : files) {
      fileList.append(file.toString()).append("\n");
    }
    return fileList.toString();
  }
}
