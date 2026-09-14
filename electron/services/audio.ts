import electron from 'electron';
const { shell } = electron;
import fs from 'fs';

export class AudioService {
  public async playAlertSound(type: 'success' | 'fail' = 'success', customPath?: string): Promise<void> {
    try {
      if (customPath && fs.existsSync(customPath)) {
        // Can open with default system media player or trigger native bell
        shell.beep();
        return;
      }

      // Default system beep/chime
      shell.beep();
    } catch (err: any) {
      console.warn('Could not trigger audio alert:', err.message);
    }
  }
}

export const audioService = new AudioService();
