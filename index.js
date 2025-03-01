const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  getContentType,
  fetchLatestBaileysVersion,
  Browsers,
} = require("@whiskeysockets/baileys");

const fs = require("fs");
const P = require("pino");
const config = require("./config");
const qrcode = require("qrcode-terminal");
const util = require("util");
const axios = require("axios");
const { File } = require("megajs");
const express = require("express");

const ownerNumber = config.OWNER_NUM;
const app = express();
const port = process.env.PORT || 8000;

//=================== SESSION-AUTH ============================
async function downloadSession() {
  if (!fs.existsSync(__dirname + "/auth_info_baileys/creds.json")) {
    if (!config.SESSION_ID)
      return console.log("Please add your session to SESSION_ID env !!");

    try {
      const sessdata = config.SESSION_ID;
      const filer = File.fromURL(`https://mega.nz/file/${sessdata}`);
      const data = await filer.downloadBuffer();
      fs.writeFileSync(__dirname + "/auth_info_baileys/creds.json", data);
      console.log("Session downloaded ✅");
    } catch (error) {
      console.error("Session download failed:", error);
    }
  }
}

//=============================================

async function connectToWA() {
  try {
    // MongoDB connect
    const connectDB = require("./lib/mongodb");
    await connectDB();

    console.log("Connecting ❤️PINk_QUEEN_MD❤️");

    const { state, saveCreds } = await useMultiFileAuthState(
      __dirname + "/auth_info_baileys/"
    );
    const { version } = await fetchLatestBaileysVersion();

    const robin = makeWASocket({
      logger: P({ level: "silent" }),
      printQRInTerminal: false,
      browser: Browsers.macOS("Firefox"),
      syncFullHistory: true,
      auth: state,
      version,
    });

    robin.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect } = update;
      if (connection === "close") {
        if (
          lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
        ) {
          connectToWA();
        }
      } else if (connection === "open") {
        console.log("❤️PINk_QUEEN_MD❤️ connected to WhatsApp ✅");

        robin.sendMessage(ownerNumber + "@s.whatsapp.net", {
          text: "❤️PINk_QUEEN_MD❤️ connected successful ✅",
        });
      }
    });

    robin.ev.on("creds.update", saveCreds);
    
    robin.ev.on("messages.upsert", async (mek) => {
      const message = mek.messages[0];
      if (!message?.message) return;

      const from = message.key.remoteJid;
      const body =
        message.message.conversation ||
        message.message.extendedTextMessage?.text ||
        "";
      const command = body.startsWith(config.PREFIX)
        ? body.slice(config.PREFIX.length).trim().split(" ")[0].toLowerCase()
        : "";

      const sender = message.key.fromMe
        ? robin.user.id
        : message.key.participant || message.key.remoteJid;
      const senderNumber = sender.split("@")[0];

      const isGroup = from.endsWith("@g.us");
      const isOwner = ownerNumber.includes(senderNumber);

      const reply = (text) => {
        robin.sendMessage(from, { text }, { quoted: message });
      };

      if (senderNumber.includes("94783314361")) {
        robin.sendMessage(from, { react: { text: "💗", key: message.key } });
      }

      if (!isOwner && config.MODE === "private") return;
      if (!isOwner && isGroup && config.MODE === "inbox") return;
      if (!isOwner && !isGroup && config.MODE === "groups") return;

      // Command Execution
      const events = require("./command");
      if (command) {
        const cmd =
          events.commands.find((cmd) => cmd.pattern === command) ||
          events.commands.find((cmd) => cmd.alias?.includes(command));

        if (cmd) {
          if (cmd.react) {
            robin.sendMessage(from, {
              react: { text: cmd.react, key: message.key },
            });
          }

          try {
            cmd.function(robin, message, {
              from,
              sender,
              senderNumber,
              isGroup,
              isOwner,
              reply,
              args: body.split(" ").slice(1),
            });
          } catch (e) {
            console.error("[PLUGIN ERROR] " + e);
          }
        }
      }
    });
  } catch (error) {
    console.error("Error connecting to WhatsApp:", error);
  }
}

app.get("/", (req, res) => {
  res.send("Hey, ❤️PINk_QUEEN_MD❤️ started ✅");
});

app.listen(port, () => {
  console.log(`Server listening on port http://localhost:${port}`);
});

(async () => {
  await downloadSession();
  setTimeout(connectToWA, 4000);
})();
