// Importa los módulos necesarios de Electron.
const { app, BrowserWindow, ipcMain } = require('electron'); 
const path = require('path');

let mainWindow;

/**
 * Crea la ventana principal de la aplicación.
 */
function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1200, 
    height: 800, 
    frame: false, 
    titleBarStyle: 'hidden', 
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false, 
      contextIsolation: true 
    }
  });

  // CARGAMOS CINEBY.APP DIRECTAMENTE
  mainWindow.loadURL('https://cineby.app'); 

  // Desactiva el menú de desarrollo.
  mainWindow.setMenu(null); 

  // Bloqueo de ventanas emergentes/redirecciones externas
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://cineby.app')) {
      return { action: 'allow' };
    }
    return { action: 'deny' }; 
  });


  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Escuchadores IPC para los comandos de ventana (minimizar, maximizar, cerrar)
app.whenReady().then(() => {
    createWindow();

    ipcMain.on('window-close', () => {
        if (mainWindow) {
            mainWindow.close();
        }
    });

    ipcMain.on('window-minimize', () => {
        if (mainWindow) {
            mainWindow.minimize();
        }
    });

    ipcMain.on('window-maximize', () => {
        if (mainWindow) {
            if (mainWindow.isMaximized()) {
                mainWindow.unmaximize();
            } else {
                mainWindow.maximize();
            }
        }
    });
});

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