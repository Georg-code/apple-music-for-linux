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
    title: "Apple Music",

    webPreferences: {
      preload: path.join(__dirname, "src/preloadScript.js"),
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

  mainWindow.webContents.on("did-navigate", () => {
    mainWindow.webContents.insertCSS(customCss);
  });

  mainWindow.webContents.on("page-title-updated", () => {
    mainWindow.webContents.insertCSS(customCss);
    mainWindow.setTitle("Apple Music");
  });

  mainWindow.webContents.on("did-frame-finish-load", () => {
    mainWindow.webContents.openDevTools();
    mainWindow.webContents.executeJavaScript(
      'Object.defineProperty(window,"a",{configurable:!0,set(e){window.postMessage({myTypeField:"my-custom-message",someData:window["audioPlayer"]}),Object.defineProperty(window,"a",{value:e})}});' // Insert here a observer if the field audioPlayer changes. Then send it to preload
    );
  });

  mainWindow.on("close", () => {
    app.exit(0);
  });
}

app.on("ready", () => {
  createWindow();
  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
    ipcMain.on("custom-message", (event, message) => {
      console.log("got an IPC message", message);
    });
  });
});

app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
