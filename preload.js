const { ipcRenderer } = require('electron');

window.prompt = function (message, defaultValue) {
  return ipcRenderer.sendSync(
    'app-prompt',
    String(message == null ? '' : message),
    defaultValue == null ? '' : String(defaultValue)
  );
};
