import { useState } from 'react';
import styles from './FileTable.module.scss';

interface file {
    key: string;
    name: string;
    size: number;
    date: string;
    extension: string;
    disabled: boolean;
}

const formatSize = (size) => {
    if (size === 0) return '0 B';

    const magnitude = Math.floor(Math.log(size) / Math.log(1024));
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'ZB', 'YB', 'RB', 'QB'];

    return `${Math.round(size / (1024 ** magnitude))} ${units[magnitude]}`;
};

interface FileTableProps {
    files: file[];
    selectedFiles: file[];
    setSelectedFiles: (files: file[]) => void;
}

export const FileTable = ({ files, selectedFiles, setSelectedFiles }: FileTableProps) => {
    const toggleFolder = (folder: file) => {
        const updatedFiles = selectedFiles.map((file) => {
            if (file.key.startsWith(folder.key)) {
                return { ...file, disabled: !file.disabled };
            }
            return file;
        });
        
        setSelectedFiles(updatedFiles);
    }

    const generateFolders = (files: file[]) => {
        const folders = new Set<string>();
        files.forEach((file) => {
            const folder = file.key.split('/').slice(0, -1).join('/');
            folders.add(folder);
        });

        return Array.from(folders);
    }

    
    return (
        <table className={styles.fileTable}>
            <thead>
                <tr>
                    <th className={styles.fileName}>Name</th>
                    <th className={styles.fileSize}>Size</th>
                    <th className={styles.fileDate}>Upload Date</th>
                </tr>
            </thead>
            <tbody>
                {files.map((file) => {
                    return <FileRenderer key={file.key} file={file} />;
                })}
            </tbody>
        </table>
    );
}

interface FolderRendererProps {
    folder: file;
    toggleFolder: (folder: file) => void;
}

const FolderRenderer = ({ folder, toggleFolder }: FolderRendererProps) => {
    // if folder is disabled it is closed, icon changes
    return (
        <tr className={styles.folder} onClick={() => toggleFolder(folder)}>
            <td className={styles.folderName}>
                <img src={folderClosed} className={styles.folderIcon} alt="Folder Icon" />
                <img src={folderOpen} className={styles.folderIcon} alt="Folder Icon" />
                {folder.name}
            </td>
            <td className={styles.folderSize}>{formatSize(folder.size)}</td>
            <td className={styles.folderDate}>{folder.date}</td>
        </tr>
    );
}


interface FileRendererProps {
    file: file;
}

const FileRenderer = ({ file }: FileRendererProps) => {


    const handleSelectFile = () => {
        console.log('File selected:', file);
    };

    // Add depth padding for folders
    // Add selected logic

    if (file.disabled) {
        return null;
    }

    return (
        <tr 
            className={styles.file}
            onClick={handleSelectFile}
            >
            <td className={styles.fileName}>{file.name}</td>
            <td className={styles.fileSize}>{formatSize(file.size)}</td>
            <td className={styles.fileDate}>{file.date}</td>
        </tr>
    );
}

export const TestFileTable = () => {
    const files: file[] = [
        {
            key: 'Folder 1/File 1',
            name: 'File 1',
            size: 1000,
            date: '2021-10-01',
            extension: 'txt',
            disabled: false,
        },
        {
            key: 'Folder 1/File 2',
            name: 'File 2',
            size: 2000,
            date: '2021-10-01',
            extension: 'txt',
            disabled: false,
        },
        {
            key: 'Folder 2/File 3',
            name: 'File 3',
            size: 3000,
            date: '2021-10-01',
            extension: 'txt',
            disabled: false,
        },
        {
            key: 'Folder 2/Folder 3/File 4',
            name: 'File 4',
            size: 4000,
            date: '2021-10-01',
            extension: 'txt',
            disabled: false,
        },
        {
            key: 'File 5',
            name: 'File 5',
            size: 5000,
            date: '2021-10-01',
            extension: 'txt',
            disabled: false,
        }
    ];

    const [selectedFiles, setSelectedFiles] = useState<file[]>([]);
    
    return (
        <FileTable files={files} selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles}/>
    );
}

