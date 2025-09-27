// Importa los módulos necesarios de Electron.
const { app, BrowserWindow, ipcMain } = require('electron'); 
const path = require('path');

let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 1200, 
    height: 800, 
    frame: true, 
    
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      // Dejamos el preload por si lo necesitamos en el futuro, pero ahora está vacío.
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false, 
      contextIsolation: true 
    }
  });

  // CARGAMOS CINEBY.APP DIRECTAMENTE
  mainWindow.loadURL('https://cineby.app'); 

  // Desactiva el menú de desarrollo.
  mainWindow.setMenu(null); 

  // === BLOQUEO DE VENTANAS EMERGENTES/REDIRECCIONES EXTERNAS ===
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    // Si la URL es cineby.app, permitimos la navegación.
    if (url.startsWith('https://cineby.app')) {
      return { action: 'allow' };
    }
    // Si es externa, bloqueamos la creación de la nueva ventana.
    return { action: 'deny' }; 
  });


  mainWindow.on('closed', () => {
    mainWindow = null;
  });
  
}

app.whenReady().then(() => {
    createWindow();
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
