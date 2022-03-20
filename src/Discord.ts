const client = require("discord-rich-presence")("954731904773537822");

export class DiscordPresence {
  constructor() {
    this.update(
      "playing",
      "Ich schreib grad nen",
      "Client dazu, daher noch nichts da",
      1337
    );
  }
  public update(
    status: "paused" | "playing",
    title?: string,
    author?: string,
    tracklenght?: number
  ) {
    client.updatePresence({
      state: status === "paused" ? "Paused" : author || "Paused",
      details:
        status == "paused" ? "No track playing" : title || "No track playing",
      startTimestamp: Date.now(),
      endTimestamp: Date.now() + 133700000,
      largeImageKey: "applemusiclogo",
      instance: true,
    });
  }
}
