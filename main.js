// Importa los módulos necesarios de Electron.
const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;


function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1200, 
    height: 800, 
    
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false, 
      contextIsolation: true
    }
  });

  mainWindow.loadURL('https://cineby.app'); // <-- ¡Ahora carga la URL!

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
