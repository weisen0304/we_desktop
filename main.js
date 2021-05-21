const { app, BrowserWindow, clipboard, session, ipcMain, nativeImage, Tray, Menu } = require('electron')
const path = require('path')

const Store = require('electron-store')
const store = new Store()

function createWindow() {
  const mainWindow = new BrowserWindow({
    show: true,
    width: 480,
    height: 600,
    minimizable: true,
    maximizable: true,
    resizable: false,
    fullscreenable: false,
    fullscreen: false,
    autoHideMenuBar: true,
    useContentSize: true,
    // transparent: true,
    frame: false,
    titleBarStyle: 'hiddenInset',
    vibrancy: 'appearance-based',
    zoomToPageWidth: true,
    icon: path.join(__dirname, 'favicon.icns'),
    webPreferences: { nodeIntegration: true }
  })

  // const cookie = { url: 'http://apps.jiutiandata.com', name: 'Token', value: store.get('Token') }
  // const cookie = { url: 'http://analysis-dev.lidakc.com', name: 'Token', value: store.get('Token') }
  const cookie = { url: 'http://fish-memory.com', name: 'Token', value: store.get('Token') }
  // const cookie = { url: 'http://192.168.3.55:8080', name: 'Token', value: store.get('Token') }
  session.defaultSession.cookies.set(cookie)

  // 查询所有 cookies。
  session.defaultSession.cookies.get({})
    .then((cookies) => {
      console.log(cookies)
    }).catch((error) => {
      console.log(error)
    })

  session.defaultSession.cookies.on('changed', function (e, cookie, cause, removed) {
    let obj = { e, cookie, cause, removed }
    console.log(cookie)
    if (cookie.name === 'Token') {
      mainWindow.setSize(1240, 900);
      mainWindow.setMaximumSize(1240, 900);
      mainWindow.setMinimumSize(1240, 900);
      mainWindow.setResizable(true)
      mainWindow.setMaximizable(true)
      mainWindow.setFullScreenable(true)
      // mainWindow.maximize()
      mainWindow.show()
      mainWindow.center()
      store.set('Token', cookie.value)
    }
    if (cookie.name === 'minimizable') {
      if (cookie.value === 'true') {
        mainWindow.minimize()
      }
    }
    if (cookie.name === 'fullscreen') {
      if (cookie.value === 'true') {
        mainWindow.setResizable(true)
        mainWindow.setMaximizable(true)
        // mainWindow.setIgnoreMouseEvents(true)
        mainWindow.setFullScreenable(true)
        // mainWindow.setFullScreen(true)
        mainWindow.maximize()
      } else {
        // mainWindow.setSize(1240, 900);
        // mainWindow.setMaximumSize(1240, 900);
        // mainWindow.setMinimumSize(1240, 900);

        // mainWindow.setResizable(true)
        // mainWindow.setMaximizable(true)
        // mainWindow.setFullScreenable(true)
        // // mainWindow.maximize()
        // mainWindow.show()
        // mainWindow.center()
        mainWindow.unmaximize()
      }
    }
    if (cookie.name === 'closable') {
      if (cookie.value === 'true') {
        mainWindow.close()
      }
    }
  })

  mainWindow.webContents.on('new-window', (event, url, frameName, disposition, options, additionalFeatures, referrer, postBody) => {
    console.log(url)
    event.preventDefault()
    const win = new BrowserWindow({
      // webContents: options.webContents, // use existing webContents if provided
      width: 1000,
      height: 800,
      frame: true,
    })
    win.once('ready-to-show', () => win.show())
    if (!options.webContents) {
      const loadOptions = {
        httpReferrer: referrer
      }
      if (postBody != null) {
        const { data, contentType, boundary } = postBody
        loadOptions.postData = postBody.data
        loadOptions.extraHeaders = `content-type: ${contentType}; boundary=${boundary}`
      }

      win.loadURL(url, loadOptions) // existing webContents will be navigated automatically
    }
    event.newGuest = win
  })

  ipcMain.on('imgUploadMain', function (res) {
    console.log('--------------------', res)
  })

  // mainWindow.loadURL('http://apps.jiutiandata.com')
  // mainWindow.loadURL('http://analysis-dev.lidakc.com')
  mainWindow.loadURL('http://fish-memory.com')
  // mainWindow.loadURL('http://192.168.3.55:8080')
  // mainWindow.webContents.openDevTools()
  // mainWindow.maximize()
  mainWindow.show()
  // mainWindow.setAlwaysOnTop(true);
  // mainWindow.loadFile('index.html')


  ipcMain.on('open-url', (event, url) => {
    console.log(url)
  });

  app.on('web-contents-created', (e, webContents) => {
    webContents.on('new-window', (event, url) => {
      event.preventDefault();
      console.log(url)
    });
  });
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })


  // 开启 开机自启动
  ipcMain.on('openAutoStart', () => {
    console.log('updateExe', process.execPath)
    app.setLoginItemSettings({
      openAtLogin: true,
      path: process.execPath,
      args: []
    });
  });
  // 关闭 开机自启动
  ipcMain.on('closeAutoStart', () => {
    app.setLoginItemSettings({
      openAtLogin: false,
      path: process.execPath,
      args: []
    });
  })

  // const trayIconPath = path.join(__dirname, 'icon.png')
  // let tray = new Tray(nativeImage.createFromPath(trayIconPath))
  // const contextMenu = Menu.buildFromTemplate([
  //   { label: 'Item1', type: 'radio' },
  //   { label: 'Item2', type: 'radio' },
  //   { label: 'Item3', type: 'radio', checked: true },
  //   { label: 'Item4', type: 'radio' }
  // ])
  // tray.setToolTip('This is my application.')
  // tray.setContextMenu(contextMenu)

  setTray()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

function setTray() {
  const trayIconPath = process.env.NODE_ENV === "development"
    ? path.join(__dirname, "../build/icon.jpg")
    : path.join(__dirname, "icon.jpg");
  const image = nativeImage.createFromPath(trayIconPath)
  appTray = new Tray(image)
  appTray.on('click', async () => {
    // 点击tray图标时触发，一般习惯点击后显示应用
    // BrowserWindow.getAllWindows().show()
  })
  if (global.process.platform !== 'darwin') {
    // setToolTip 仅在win上显示， 在mac上使用不会报错但也没有效果的样子
    appTray.setToolTip('we_desktop')
    /** 
     * tray设置contextmenu后，在mac端的click事件将会无效
     * 为了表现与其他应用一致，不在mac上设置该属性
     * 在mac上可以右键程序坞上的应用图标关闭应用
     */
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '退出应用',
        icon: image,
        click: async () => {
          app.quit()
        }
      }
    ])
    appTray.setContextMenu(contextMenu)
  } else {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '退出应用',
        icon: image,
        click: async () => {
          app.quit()
        }
      }
    ])
    appTray.setContextMenu(contextMenu)
  }
}
