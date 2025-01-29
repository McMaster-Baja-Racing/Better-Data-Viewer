import { useEffect, useState } from 'react';
import styles from './FileTable.module.scss';
import React from 'react';

interface file {
    key: string;
    name: string;
    size: number;
    date: string;
    extension: string;
}

interface folder {
    key: string;
    name: string;
    size: number;
    date: string;
    children: (file | folder)[];
}

const formatSize = (size: number) => {
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
    const buildHierarchy = (files: file[]): folder => {
        const root: folder = {
            key: '',
            name: 'Root',
            size: 0,
            date: '',
            children: [],
        };

        files.forEach((file) => {
            const pathParts = file.key.split('/');
            let currentFolder = root;

            pathParts.forEach((part, index) => {
                if (index === pathParts.length - 1) {
                    // Add file at the final level
                    currentFolder.children.push(file);
                } else {
                    // Add or find the folder
                    let folder = currentFolder.children.find(
                        (child) => 'key' in child && child.key === pathParts.slice(0, index + 1).join('/')
                    ) as folder;

                    if (!folder) {
                        folder = {
                            key: pathParts.slice(0, index + 1).join('/'),
                            name: part,
                            size: 0,
                            date: '',
                            children: [],
                        };
                        currentFolder.children.push(folder);
                    }

                    currentFolder = folder;
                }
            });
        });

        return root;
    };

    const [folderTree, setFolderTree] = useState<folder | null>(null);

    useEffect(() => {
        setFolderTree(buildHierarchy(files));
    }, [files]);

    
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
            {folderTree && <FolderRenderer folder={folderTree} />}
            </tbody>
        </table>
    );
}

interface FolderRendererProps {
    folder: folder;
    depth?: number;
}

const FolderRenderer = ({ folder, depth = 0 }: FolderRendererProps) => {
    const handleClickFolder = (folder: folder) => {
        console.log('Folder selected:', folder);
    };

    return (
        <>
            {depth > 0 && 
            <tr className={styles.folder} onClick={() => handleClickFolder(folder)}>
                <td className={styles.folderName}>
                    <i className={`${false ? 'fa fa-folder-open-o' : 'fa fa-folder-o'}`} aria-hidden="true" />
                    {folder.name}
                </td>
                <td className={styles.folderSize}>{formatSize(folder.size)}</td>
                <td className={styles.folderDate}>{folder.date}</td>
            </tr>}
            {folder.children.map((child) =>
                'children' in child ? (
                    <FolderRenderer key={child.key} folder={child as folder} depth={depth + 1} />
                ) : (
                    <FileRenderer key={child.key} file={child as file} depth={depth + 1}/>
                )
            )}
        </>
    );
}


interface FileRendererProps {
    file: file;
    depth: number;
}

const FileRenderer = ({ file, depth }: FileRendererProps) => {


    const handleSelectFile = () => {
        console.log('File selected:', file);
    };

    // Add depth padding for folders
    // Add selected logic

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
        },
        {
            key: 'Folder 1/File 2',
            name: 'File 2',
            size: 2000,
            date: '2021-10-01',
            extension: 'txt',
        },
        {
            key: 'Folder 2/File 3',
            name: 'File 3',
            size: 3000,
            date: '2021-10-01',
            extension: 'txt',
        },
        {
            key: 'Folder 2/Folder 3/File 4',
            name: 'File 4',
            size: 4000,
            date: '2021-10-01',
            extension: 'txt',
        },
        {
            key: 'File 5',
            name: 'File 5',
            size: 5000,
            date: '2021-10-01',
            extension: 'txt',
        }
    ];

    const [selectedFiles, setSelectedFiles] = useState<file[]>([]);
    
    return (
        <FileTable files={files} selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles}/>
    );
}

