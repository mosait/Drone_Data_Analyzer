// src/types/filesystem.d.ts
interface FileSystemHandle {
    kind: 'file' | 'directory';
    name: string;
  }
  
  interface FileSystemDirectoryHandle extends FileSystemHandle {
    kind: 'directory';
    values(): AsyncIterableIterator<FileSystemHandle>;
  }
  
  interface Window {
    showDirectoryPicker(options?: {
      mode?: 'read' | 'readwrite'
    }): Promise<FileSystemDirectoryHandle>;
  }