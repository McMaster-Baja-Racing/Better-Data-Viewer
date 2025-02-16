import { useEffect, useState } from 'react';
import styles from './FileTable.module.scss';
import cx from 'classnames';
import folderIcon from '@assets/icons/folder.svg';
import folderOpenIcon from '@assets/icons/folderOpen.svg';
import { File, Folder } from '@types';

const formatSize = (size: number) => {
    if (size === 0) return '0 B';

    const magnitude = Math.floor(Math.log(size) / Math.log(1024));
    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'ZB', 'YB', 'RB', 'QB'];

    return `${Math.round(size / (1024 ** magnitude))} ${units[magnitude]}`;
};

const depthPadding = (depth: number) => {
    return {
        paddingLeft: `${0.75 + (depth - 1) * 1}rem`
    };
}

const buildHierarchy = (files: File[]): Folder => {
    const root: Folder = {
        key: '',
        name: 'Root',
        size: 0,
        date: '',
        children: [],
    };

    const dateMap: Record<string, string[]> = {};
    const sizeMap: Record<string, number> = {};

    files.forEach((file) => {
        const pathParts = file.key.split('/');
        let currentFolder = root;

        pathParts.forEach((part, index) => {
            const folderKey = pathParts.slice(0, index + 1).join('/');

            if (index === pathParts.length - 1) {
                // Add file at the final level
                currentFolder.children.push(file);
            } else {
                // Add or find the folder
                let folder = currentFolder.children.find(
                    (child) => 'children' in child && child.key === folderKey
                ) as Folder;

                if (!folder) {
                    folder = {
                        key: folderKey,
                        name: part,
                        size: 0,
                        date: '',
                        children: [],
                    };
                    currentFolder.children.push(folder);
                }

                currentFolder = folder;
            }

            // Store the file size and date for later computation
            if (!sizeMap[folderKey]) sizeMap[folderKey] = 0;
            if (!dateMap[folderKey]) dateMap[folderKey] = [];

            sizeMap[folderKey] += file.size;
            dateMap[folderKey].push(file.date);
        });
    });

    // Function to assign computed date and size to folders
    const assignComputedValues = (folder: Folder) => {
        folder.children.forEach((child) => {
            if ('children' in child) {
                assignComputedValues(child);
            }
        });

        if (folder.key) {
            folder.size = sizeMap[folder.key] || 0;
            folder.date = dateMap[folder.key]?.sort()[0] || ''; // Earliest date
        }
    };

    assignComputedValues(root);
    return root;
};

interface FileTableProps {
    files: File[];
    selectedFiles: File[];
    setSelectedFiles: (files: File[]) => void;
}

export const FileTable = ({ files, selectedFiles, setSelectedFiles }: FileTableProps) => {
    const [folderTree, setFolderTree] = useState<Folder | null>(null);

    useEffect(() => {
        setFolderTree(buildHierarchy(files));
    }, [files]);

    
    return (
        <table className={styles.fileTable}>
        <colgroup>
            <col style={{ width: '65%' }} />
            <col style={{ width: '17.5%' }} />
            <col style={{ width: '17.5%' }} />
        </colgroup>
            <thead>
                <tr>
                    <th className={styles.fileName}>Name</th>
                    <th className={styles.fileSize}>Size</th>
                    <th className={styles.fileDate}>Upload Date</th>
                </tr>
            </thead>
            <tbody>
            {folderTree && <FolderRenderer folder={folderTree} selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles} />}
            </tbody>
        </table>
    );
}

interface FolderRendererProps {
    folder: Folder;
    depth?: number;
    selectedFiles: File[];
    setSelectedFiles: (files: File[]) => void;
}

const FolderRenderer = ({ folder, depth = 0, selectedFiles, setSelectedFiles }: FolderRendererProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleFolder = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            {depth > 0 && 
            <tr className={styles.folder} onClick={toggleFolder}>
                <td className={styles.folderName} style={depthPadding(depth)}>
                    <img 
                        src={isOpen ? folderOpenIcon : folderIcon} 
                        alt={isOpen ? 'Open folder icon' : 'Folder icon'} 
                        aria-hidden="true" 
                    />
                    {folder.name}
                </td>
                <td className={styles.folderSize}>{formatSize(folder.size)}</td>
                <td className={styles.folderDate}>{folder.date}</td>
            </tr>}
            {(isOpen || depth == 0) &&
                folder.children.map((child) =>
                    'children' in child ? (
                        <FolderRenderer 
                            key={child.key}
                            folder={child}
                            depth={depth + 1}
                            selectedFiles={selectedFiles}
                            setSelectedFiles={setSelectedFiles}
                        />
                    ) : (
                        <FileRenderer 
                            key={child.key}
                            file={child}
                            depth={depth + 1}
                            selectedFiles={selectedFiles}
                            setSelectedFiles={setSelectedFiles}
                        />
                    )
                )}
        </>
    );
}

interface FileRendererProps {
    file: File;
    depth: number;
    selectedFiles: File[];
    setSelectedFiles: (files: File[]) => void;
}

const FileRenderer = ({ file, depth, selectedFiles, setSelectedFiles }: FileRendererProps) => {
    const isSelected = selectedFiles.some(selected => selected.key === file.key);

    const handleSelectFile = () => {
        setSelectedFiles(
          isSelected 
            ? selectedFiles.filter(selected => selected.key !== file.key) 
            : [...selectedFiles, file]
        );
      };

    return (
        <tr 
            className={cx(styles.file, { [styles.selected]: isSelected })}
            onClick={handleSelectFile}
            >
            <td className={styles.fileName} style={depthPadding(depth)}>{file.name}</td>
            <td className={styles.fileSize}>{formatSize(file.size)}</td>
            <td className={styles.fileDate}>{file.date}</td>
        </tr>
    );
}

export const TestFileTable = () => {
    const files: File[] = [
        {
            key: 'Folder 1/File 1 AAAAAAAAAAAAAAA',
            name: 'File 1 AAAAAAAAAAAAAAAA',
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

    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    
    return (
        <FileTable files={files} selectedFiles={selectedFiles} setSelectedFiles={setSelectedFiles}/>
    );
}

