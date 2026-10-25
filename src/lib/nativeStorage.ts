import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

class NativeStorage {
  private isInitialized = false;
  private baseDir = 'Tummoc';

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check if running on native platform
      if (!Capacitor.isNativePlatform()) {
        console.log('Not running on native platform, storage will use localStorage fallback');
        this.isInitialized = true;
        return;
      }

      // Create base directory
      await this.createDirectory('');
      this.isInitialized = true;
      console.log('Native storage initialized successfully');
    } catch (error) {
      console.error('Failed to initialize native storage:', error);
      throw error;
    }
  }

  async createFolderStructure(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    const folders = [
      'user',
      'settings',
      'passes',
      'passes/active',
      'passes/expired',
      'verification',
      'verification/active',
      'verification/expired',
      'wallet',
      'scans',
      'config',
    ];

    try {
      for (const folder of folders) {
        await this.createDirectory(folder);
      }
      console.log('Folder structure created successfully');
    } catch (error) {
      console.error('Failed to create folder structure:', error);
    }
  }

  private async createDirectory(path: string): Promise<void> {
    try {
      const fullPath = path ? `${this.baseDir}/${path}` : this.baseDir;
      await Filesystem.mkdir({
        path: fullPath,
        directory: Directory.Documents,
        recursive: true,
      });
    } catch (error: any) {
      // Ignore "directory already exists" errors
      if (!error.message?.includes('already exists')) {
        throw error;
      }
    }
  }

  async writeJSON<T>(path: string, data: T): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      // Fallback to localStorage
      localStorage.setItem(path, JSON.stringify(data));
      return;
    }

    try {
      const jsonData = JSON.stringify(data, null, 2);
      await Filesystem.writeFile({
        path: `${this.baseDir}/${path}`,
        data: jsonData,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });
    } catch (error) {
      console.error(`Failed to write JSON to ${path}:`, error);
      throw error;
    }
  }

  async readJSON<T>(path: string, defaultValue?: T): Promise<T | null> {
    if (!Capacitor.isNativePlatform()) {
      // Fallback to localStorage
      const data = localStorage.getItem(path);
      return data ? JSON.parse(data) : (defaultValue || null);
    }

    try {
      const result = await Filesystem.readFile({
        path: `${this.baseDir}/${path}`,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });
      return JSON.parse(result.data as string);
    } catch (error: any) {
      if (error.message?.includes('File does not exist')) {
        return defaultValue || null;
      }
      console.error(`Failed to read JSON from ${path}:`, error);
      return defaultValue || null;
    }
  }

  async writeFile(path: string, data: string): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      localStorage.setItem(path, data);
      return;
    }

    try {
      await Filesystem.writeFile({
        path: `${this.baseDir}/${path}`,
        data: data,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });
    } catch (error) {
      console.error(`Failed to write file ${path}:`, error);
      throw error;
    }
  }

  async readFile(path: string): Promise<string | null> {
    if (!Capacitor.isNativePlatform()) {
      return localStorage.getItem(path);
    }

    try {
      const result = await Filesystem.readFile({
        path: `${this.baseDir}/${path}`,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      });
      return result.data as string;
    } catch (error: any) {
      if (error.message?.includes('File does not exist')) {
        return null;
      }
      console.error(`Failed to read file ${path}:`, error);
      return null;
    }
  }

  async deleteFile(path: string): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      localStorage.removeItem(path);
      return;
    }

    try {
      await Filesystem.deleteFile({
        path: `${this.baseDir}/${path}`,
        directory: Directory.Documents,
      });
    } catch (error: any) {
      if (!error.message?.includes('File does not exist')) {
        console.error(`Failed to delete file ${path}:`, error);
      }
    }
  }

  async fileExists(path: string): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      return localStorage.getItem(path) !== null;
    }

    try {
      await Filesystem.stat({
        path: `${this.baseDir}/${path}`,
        directory: Directory.Documents,
      });
      return true;
    } catch {
      return false;
    }
  }

  async listFiles(path: string): Promise<string[]> {
    if (!Capacitor.isNativePlatform()) {
      return [];
    }

    try {
      const result = await Filesystem.readdir({
        path: `${this.baseDir}/${path}`,
        directory: Directory.Documents,
      });
      return result.files.map(f => f.name || f as unknown as string);
    } catch (error) {
      console.error(`Failed to list files in ${path}:`, error);
      return [];
    }
  }
}

export const nativeStorage = new NativeStorage();
