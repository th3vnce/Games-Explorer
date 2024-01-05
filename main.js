// main.js

const { app, BrowserWindow, ipcMain } = require('electron');

let mainWindow;

async function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: __dirname + '/preload.js', // Use the preload script
        },
    });

    await mainWindow.loadFile('launcher_main.html');

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();
});

app.on('activate', function () {
    if (mainWindow === null) createWindow();
});

// Dynamic import for steamgriddb
(async () => {
    const { default: SGDB } = await import('steamgriddb');
    const apiKey = 'b75868e1e090c5d117a6a99e8fd81685';
    const client = new SGDB(apiKey);

    ipcMain.handle('searchGame', async (_, searchInput) => {
        try {
            const games = await client.searchGame(searchInput);
            return games;
        } catch (error) {
            throw new Error(error.message);
        }
    });

    ipcMain.handle('getGridsById', async (_, gameId) => {
        try {
            const grids = await client.getGrids({ type: 'game', id: gameId, dimensions: ["600x900"] });
            return grids;
        } catch (error) {
            throw new Error(error.message);
        }
    });
})();
