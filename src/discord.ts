const client = require("discord-rich-presence")("954731904773537822");

export class DiscordPresence {
  constructor() {
    this.update();
  }
  public update() {
    client.updatePresence({
      state: "By KIZ",
      details: "Hura diese Welt geht unter",
      startTimestamp: Date.now(),
      endTimestamp: Date.now() + 1337,
      largeImageKey: "applemusiclogo",
      instance: true,
    });
  }
}
