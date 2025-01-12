// src/types/filesystem.d.ts

type PermissionState = 'granted' | 'denied' | 'prompt';
type PermissionName = 'clipboard-read' | 'clipboard-write' | 'file-system';

interface PermissionDescriptor {
  name: PermissionName;
  mode?: 'read' | 'readwrite';
  handle?: FileSystemHandle;
}

interface NavigatorPermissions {
  request(permissionDesc: { name: string }): Promise<PermissionStatus>;
}

interface Navigator {
  permissions?: NavigatorPermissions;
}

interface FileSystemPermissionDescriptor {
  mode?: 'read' | 'readwrite';
}

interface FileSystemHandle {
  kind: 'file' | 'directory';
  name: string;
  queryPermission(descriptor: FileSystemPermissionDescriptor): Promise<PermissionState>;
  requestPermission(descriptor: FileSystemPermissionDescriptor): Promise<PermissionState>;
}

interface FileSystemFileHandle extends FileSystemHandle {
  kind: 'file';
  getFile(): Promise<File>;
  createWritable(options?: { keepExistingData?: boolean }): Promise<FileSystemWritableFileStream>;
}

interface FileSystemDirectoryHandle extends FileSystemHandle {
  kind: 'directory';
  values(): AsyncIterableIterator<FileSystemHandle>;
  getFileHandle(name: string, options?: { create?: boolean }): Promise<FileSystemFileHandle>;
  getDirectoryHandle(name: string, options?: { create?: boolean }): Promise<FileSystemDirectoryHandle>;
}

interface Window {
  showDirectoryPicker(options?: {
    id?: string;
    mode?: 'read' | 'readwrite';
    startIn?: FileSystemHandle | 'desktop' | 'documents' | 'downloads' | 'music' | 'pictures' | 'videos';
  }): Promise<FileSystemDirectoryHandle>;
  
  showOpenFilePicker(options?: {
    multiple?: boolean;
    excludeAcceptAllOption?: boolean;
    types?: {
      description?: string;
      accept: Record<string, string[]>;
    }[];
  }): Promise<FileSystemFileHandle[]>;
}
