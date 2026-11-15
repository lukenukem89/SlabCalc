// Exposes a tiny, safe API to the page. In a plain browser window.slabcalc is undefined
// and the page falls back to window.print().
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('slabcalc', {
  isApp: true,
  savePDF: (suggestedName) => ipcRenderer.invoke('save-pdf', suggestedName)
});
