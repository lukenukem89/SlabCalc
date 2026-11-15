// SlabCalc desktop shell: one window around SlabCalc.html, plus native PDF saving.
const { app, BrowserWindow, ipcMain, dialog, shell, session } = require('electron');
const path = require('path');
const fs = require('fs/promises');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1440,
    height: 940,
    minWidth: 1000,
    minHeight: 700,
    title: 'SlabCalc',
    backgroundColor: '#F4F3F0',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  win.loadFile(path.join(__dirname, '..', 'SlabCalc.html'));

  // Links to other sites open in the user's browser, not inside the app.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    if (!url.startsWith('file:')) { e.preventDefault(); if (/^https?:/.test(url)) shell.openExternal(url); }
  });
}

// OpenStreetMap's address search asks clients to identify themselves.
function setGeocoderUserAgent() {
  session.defaultSession.webRequest.onBeforeSendHeaders(
    { urls: ['https://nominatim.openstreetmap.org/*'] },
    (details, cb) => {
      details.requestHeaders['User-Agent'] = 'SlabCalc/' + app.getVersion() + ' (desktop concrete estimating app)';
      cb({ requestHeaders: details.requestHeaders });
    }
  );
}

ipcMain.handle('save-pdf', async (event, suggestedName) => {
  const wc = event.sender;
  const owner = BrowserWindow.fromWebContents(wc);
  const name = String(suggestedName || 'Proposal.pdf').replace(/[\\/:*?"<>|]+/g, '').slice(0, 120) || 'Proposal.pdf';
  const { canceled, filePath } = await dialog.showSaveDialog(owner, {
    title: 'Save proposal as PDF',
    defaultPath: path.join(app.getPath('documents'), name.endsWith('.pdf') ? name : name + '.pdf'),
    filters: [{ name: 'PDF', extensions: ['pdf'] }]
  });
  if (canceled || !filePath) return { saved: false };
  try {
    const data = await wc.printToPDF({
      pageSize: 'Letter',
      printBackground: true,
      preferCSSPageSize: true,
      margins: { marginType: 'none' }
    });
    await fs.writeFile(filePath, data);
    shell.showItemInFolder(filePath);
    return { saved: true, filePath };
  } catch (err) {
    return { saved: false, error: err.message };
  }
});

app.whenReady().then(() => {
  setGeocoderUserAgent();
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
