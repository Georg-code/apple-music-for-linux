const { ipcRenderer } = require("electron");

process.once("loaded", () => {
  window.addEventListener("message", (event) => {
    const message = event.data;

    if (message.myTypeField === "my-custom-message") {
      ipcRenderer.send("custom-message", message);
    }
  });
});
