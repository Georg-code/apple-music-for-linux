import {
  app,
  BrowserWindow,
  Menu,
  shell,
  nativeTheme,
  ipcMain,
} from "electron";
import * as fs from "fs";
import { DiscordPresence } from "./src/Discord";

import * as path from "path";

const discord = new DiscordPresence();

const appName = "Apple Music";

enum theme {
  light,
  dark,
  system,
}

if (process.env.SNAP_USER_COMMON) {
  var localeFile = process.env.SNAP_USER_COMMON + "/locale";
  if (!fs.existsSync(localeFile)) {
    fs.writeFileSync(localeFile, app.getLocaleCountryCode());
  }
  var locale = fs
    .readFileSync(localeFile)
    .toString()
    .substring(0, 2)
    .toUpperCase();

  var themeFile = process.env.SNAP_USER_COMMON + "/theme";
  if (!fs.existsSync(themeFile)) {
    fs.writeFileSync(themeFile, "light");
  }
  nativeTheme.themeSource =
    theme[
      fs.readFileSync(themeFile).toString().toLocaleLowerCase() as keyof theme
    ];
} else {
  locale = app.getLocaleCountryCode();
  themeFile = null;
  nativeTheme.themeSource = "light";
}

const appUrl = "https://music.apple.com/";

const customCss = ".web-navigation__native-upsell {display: none !important;}";

function createWindow() {
  Menu.setApplicationMenu(null);

  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 600,
    title: appName,
    webPreferences: {
      preload: path.join(__dirname, "src/preload.js"), //You need to create a file named preload.js (or any name) in your code
      contextIsolation: false,
      webviewTag: true,
      nodeIntegration: true,
    },
  });
  mainWindow.loadURL(appUrl + locale.toLowerCase() + "/browse");

  mainWindow.webContents.on("before-input-event", (event, input) => {
    if (
      input.type === "keyUp" &&
      input.control &&
      input.key.toLowerCase() === "r"
    ) {
      mainWindow.reload();
    } else if (
      input.type === "keyUp" &&
      input.control &&
      input.key.toLowerCase() === "d"
    ) {
      if (nativeTheme.themeSource === "light") {
        nativeTheme.themeSource = "dark";
      } else {
        nativeTheme.themeSource = "light";
      }
      if (themeFile) {
        fs.writeFileSync(themeFile, nativeTheme.themeSource);
      }
    }
  });

  mainWindow.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith(appUrl)) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  mainWindow.webContents.on(
    "new-window",
    (event, url, frameName, disposition, options) => {
      event.preventDefault();
      shell.openExternal(url);
    }
  );

  mainWindow.webContents.on("did-navigate", () => {
    mainWindow.webContents.insertCSS(customCss);
  });

  mainWindow.webContents.on("page-title-updated", () => {
    mainWindow.webContents.insertCSS(customCss);
    mainWindow.setTitle(appName);
  });

  mainWindow.webContents.on("did-frame-finish-load", () => {
    console.info("ready-to-show");
    mainWindow.webContents
      .executeJavaScript("window.audioPlayer", false)
      .then((result) => {
        console.log(result);
      });
  });

  mainWindow.on("close", () => {
    app.exit(0);
  });
}

app.on("ready", () => {
  createWindow();
  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.on("musicplayer-data", () => {});
