const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    backgroundColor: '#f3f5f8',
    autoHideMenuBar: true,
    title: 'AR Calculation Tool',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: false,
      nodeIntegration: false
    }
  });
  win.maximize();
  win.loadFile(path.join(__dirname, 'index.html'));
}

// Electron does not support window.prompt(), so we provide our own
// blocking prompt (same behaviour: returns text, or null on cancel).
ipcMain.on('app-prompt', (event, message, defaultValue) => {
  const parent = BrowserWindow.fromWebContents(event.sender);
  let answered = false;

  const child = new BrowserWindow({
    parent,
    modal: true,
    width: 480,
    height: 280,
    resizable: false,
    minimizable: false,
    maximizable: false,
    autoHideMenuBar: true,
    title: 'Input needed',
    webPreferences: { nodeIntegration: true, contextIsolation: false }
  });
  child.setMenu(null);

  const onResult = (e, value) => {
    if (e.sender !== child.webContents) return;
    answered = true;
    event.returnValue = value;
    child.close();
  };
  ipcMain.on('app-prompt-result', onResult);

  child.on('closed', () => {
    ipcMain.removeListener('app-prompt-result', onResult);
    if (!answered) event.returnValue = null;
  });

  child.loadFile(path.join(__dirname, 'prompt.html'));
  child.webContents.on('did-finish-load', () => {
    child.webContents.send('prompt-init', message, defaultValue);
  });
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
