export interface File {
  key: string;
  name: string;
  size: number;
  date: string;
  extension: string;
}

export interface Folder {
  key: string;
  name: string;
  size: number;
  date: string;
  children: (File | Folder)[];
}