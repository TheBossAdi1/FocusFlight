const { app, BrowserWindow } = require('electron')
const path = require('path')

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: 'FocusFlight',
    backgroundColor: '#070C18', // Match app background
    webPreferences: { 
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  // Hide menu bar for a more immersive "cockpit" feel
  win.setMenuBarVisibility(false)

  win.loadFile(path.join(__dirname, '../dist/index.html'))
}

app.whenReady().then(createWindow)
app.on('window-all-closed', () => app.quit())