// src/types/filesystem.d.ts

interface FileSystemHandle {
  kind: 'file' | 'directory';
  name: string;
  /**
   * Request permission to read or write the handle
   */
  requestPermission(options?: { mode?: 'read' | 'readwrite' }): Promise<'granted' | 'denied'>;
}

interface FileSystemFileHandle extends FileSystemHandle {
  kind: 'file';
  /**
   * Get the file represented by this handle
   */
  getFile(): Promise<File>;
  /**
   * Create a writable stream to write to the file
   */
  createWritable(options?: { keepExistingData?: boolean }): Promise<FileSystemWritableFileStream>;
}

interface FileSystemDirectoryHandle extends FileSystemHandle {
  kind: 'directory';
  /**
   * Get an iterator of the entries in the directory
   */
  values(): AsyncIterableIterator<FileSystemHandle>;
  /**
   * Get an entry from the directory
   */
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>;
  /**
   * Get a directory entry
   */
  getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<FileSystemDirectoryHandle>;
}

interface Window {
  /**
   * Show a directory picker dialog
   */
  showDirectoryPicker(options?: {
    id?: string;
    mode?: 'read' | 'readwrite';
    startIn?: FileSystemHandle | 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos';
  }): Promise<FileSystemDirectoryHandle>;
  
  /**
   * Show a file picker dialog
   */
  showOpenFilePicker(options?: {
    multiple?: boolean;
    excludeAcceptAllOption?: boolean;
    types?: {
      description?: string;
      accept: Record<string, string[]>;
    }[];
  }): Promise<FileSystemFileHandle[]>;
}