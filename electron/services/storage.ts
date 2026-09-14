import electron from 'electron';
import type { BrowserWindow } from 'electron';
const { dialog } = electron;
import fs from 'fs/promises';
import path from 'path';

export async function exportBackupToFile(
  data: string,
  window?: BrowserWindow
): Promise<{ success: boolean; filePath?: string }> {
  try {
    const defaultPath = path.join(
      process.env.USERPROFILE || process.env.HOME || '.',
      `blank-bot-backup-${new Date().toISOString().slice(0, 10)}.json`
    );

    const { canceled, filePath } = await dialog.showSaveDialog(window || null as any, {
      title: 'Export Encrypted Blank Bot State Backup',
      defaultPath,
      filters: [{ name: 'JSON Backup', extensions: ['json'] }],
    });

    if (canceled || !filePath) {
      return { success: false };
    }

    await fs.writeFile(filePath, data, 'utf8');
    return { success: true, filePath };
  } catch (err: any) {
    console.error('Export backup failed:', err);
    return { success: false };
  }
}

export async function importBackupFromFile(
  window?: BrowserWindow
): Promise<{ success: boolean; data?: string }> {
  try {
    const { canceled, filePaths } = await dialog.showOpenDialog(window || null as any, {
      title: 'Import Blank Bot State Backup',
      properties: ['openFile'],
      filters: [{ name: 'JSON Backup', extensions: ['json'] }],
    });

    if (canceled || !filePaths || filePaths.length === 0) {
      return { success: false };
    }

    const content = await fs.readFile(filePaths[0], 'utf8');
    return { success: true, data: content };
  } catch (err: any) {
    console.error('Import backup failed:', err);
    return { success: false };
  }
}
