export interface file {
  key: string;
  name: string;
  size: number;
  date: string;
  extension: string;
}

export interface folder {
  key: string;
  name: string;
  size: number;
  date: string;
  children: (file | folder)[];
}