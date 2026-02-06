import { execFile } from 'child_process';
import { existsSync } from 'fs';

export default class RunAppleScript {
  constructor(context, $UD) {
    this.$UD = $UD;
    this.context = context;
    this.config = {};
    this.isRunning = false;
    this.statusTimeout = null;

    this.setStateIcon('idle');
  }

  add() {
    this.setStateIcon('idle');
  }

  setActive(active) {
    this.setStateIcon('idle');
  }

  setParams(params) {
    this.config = {
      ...this.config,
      ...params
    };
    this.setStateIcon('idle');
  }

  run() {
    const scriptPath = this.config.script_path;

    if (!scriptPath) {
      this.showStatus('error', 'No File');
      return;
    }

    if (!existsSync(scriptPath)) {
      this.showStatus('error', 'Not Found');
      return;
    }

    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.setStateIcon('running');

    execFile('/usr/bin/osascript', [scriptPath], { timeout: 30000 }, (error, stdout, stderr) => {
      this.isRunning = false;

      if (error) {
        console.error('AppleScript error:', error.message);
        if (stderr) console.error('stderr:', stderr);
        this.showStatus('error', 'Error');
      } else {
        if (stdout) console.log('AppleScript output:', stdout.trim());
        this.showStatus('success', 'Done');
      }
    });
  }

  clear() {
    if (this.statusTimeout) {
      clearTimeout(this.statusTimeout);
      this.statusTimeout = null;
    }
  }

  showStatus(status, text) {
    this.setStateIcon(status, text);
    if (this.statusTimeout) clearTimeout(this.statusTimeout);
    this.statusTimeout = setTimeout(() => {
      this.setStateIcon('idle');
    }, 3000);
  }

  setStateIcon(status, text) {
    const statusText = {
      idle: '',
      running: 'Running...',
      success: text || 'Done',
      error: text || 'Error'
    };

    const displayText = statusText[status] || '';
    this.$UD.setStateIcon(this.context, 0, displayText);
  }
}
