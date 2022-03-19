"use strict";
exports.__esModule = true;
var electron_1 = require("electron");
var fs = require("fs");
var discord_1 = require("./src/discord");
var discord = new discord_1.DiscordPresence();
discord.update();
var appName = "Apple Music";
var theme;
(function (theme) {
    theme[theme["light"] = 0] = "light";
    theme[theme["dark"] = 1] = "dark";
    theme[theme["system"] = 2] = "system";
})(theme || (theme = {}));
if (process.env.SNAP_USER_COMMON) {
    var localeFile = process.env.SNAP_USER_COMMON + "/locale";
    if (!fs.existsSync(localeFile)) {
        fs.writeFileSync(localeFile, electron_1.app.getLocaleCountryCode());
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
    electron_1.nativeTheme.themeSource =
        theme[fs.readFileSync(themeFile).toString().toLocaleLowerCase()];
}
else {
    locale = electron_1.app.getLocaleCountryCode();
    themeFile = null;
    electron_1.nativeTheme.themeSource = "light";
}
var appUrl = "https://music.apple.com/";
var customCss = ".web-navigation__native-upsell {display: none !important;}";
function createWindow() {
    electron_1.Menu.setApplicationMenu(null);
    var mainWindow = new electron_1.BrowserWindow({
        width: 1000,
        height: 600,
        title: appName
    });
    mainWindow.loadURL(appUrl + locale.toLowerCase() + "/browse");
    mainWindow.webContents.on("before-input-event", function (event, input) {
        if (input.type === "keyUp" &&
            input.control &&
            input.key.toLowerCase() === "r") {
            mainWindow.reload();
        }
        else if (input.type === "keyUp" &&
            input.control &&
            input.key.toLowerCase() === "d") {
            if (electron_1.nativeTheme.themeSource === "light") {
                electron_1.nativeTheme.themeSource = "dark";
            }
            else {
                electron_1.nativeTheme.themeSource = "light";
            }
            if (themeFile) {
                fs.writeFileSync(themeFile, electron_1.nativeTheme.themeSource);
            }
        }
    });
    mainWindow.webContents.on("will-navigate", function (event, url) {
        if (!url.startsWith(appUrl)) {
            event.preventDefault();
            electron_1.shell.openExternal(url);
        }
    });
    mainWindow.webContents.on("new-window", function (event, url, frameName, disposition, options) {
        event.preventDefault();
        electron_1.shell.openExternal(url);
    });
    mainWindow.webContents.on("did-navigate", function () {
        mainWindow.webContents.insertCSS(customCss);
    });
    mainWindow.webContents.on("page-title-updated", function () {
        mainWindow.webContents.insertCSS(customCss);
        mainWindow.setTitle(appName);
    });
    mainWindow.on("close", function () {
        electron_1.app.exit(0);
    });
}
electron_1.app.on("ready", function () {
    createWindow();
    electron_1.app.on("activate", function () {
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
electron_1.app.on("window-all-closed", function () {
    if (process.platform !== "darwin")
        electron_1.app.quit();
});
