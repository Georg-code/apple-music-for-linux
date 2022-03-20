alert("loaded");

import { webContents } from "electron";

webContents.getAllWebContents().forEach((webContents) => {
  webContents.executeJavaScript("window.audioPlayer", false).then((result) => {
    alert(result);
  });
});
